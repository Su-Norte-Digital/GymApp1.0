import { supabase } from '../lib/supabaseClient'

/**
 * Repositorio de Perfiles - Capa de acceso a datos para profiles
 * Todos los métodos propagan errores hacia arriba para manejo en la UI
 */

/**
 * Helper para timeout de promesas
 */
const timeout = (ms) => new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), ms)
);

export async function getProfile(userId) {
    console.log('[Repo/Profiles] Iniciando select getProfile para:', userId)
    try {
        // Ejecutamos la promesa de Supabase con un límite de 8 segundos
        const { data, error } = await Promise.race([
            supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single(),
            timeout(8000) // 8 segundos de espera máxima
        ])

        if (error) {
            console.error('[Repo/Profiles] Error en select:', error)
            throw error
        }
        console.log('[Repo/Profiles] Data recibida:', data)
        return data
    } catch (err) {
        if (err.message === 'TIMEOUT_EXCEEDED') {
            console.error('[Repo/Profiles] Error: La base de datos tardó demasiado en responder.')
        } else {
            console.error('[Repo/Profiles] Catch en getProfile:', err)
        }
        throw err
    }
}

export async function createProfile(profileData) {
    const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getAllProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nombre', { ascending: true })

    if (error) throw error
    return data
}

export async function searchProfiles(query) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`nombre.ilike.%${query}%,dni.ilike.%${query}%`)
        .order('nombre', { ascending: true })

    if (error) throw error
    return data
}

export async function updateFechaVencimiento(userId, nuevaFecha) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ fecha_vencimiento: nuevaFecha })
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

/** Calcula si el perfil está vencido, por vencer (≤3 días) o activo */
export function calcularEstadoCuota(fechaVencimiento) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const vencimiento = new Date(fechaVencimiento)
    vencimiento.setHours(0, 0, 0, 0)

    const diffMs = vencimiento - hoy
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDias < 0) return { estado: 'vencido', diasRestantes: diffDias, variant: 'danger' }
    if (diffDias <= 3) return { estado: 'por_vencer', diasRestantes: diffDias, variant: 'warning' }
    return { estado: 'activo', diasRestantes: diffDias, variant: 'success' }
}
