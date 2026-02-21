import { supabase } from '../lib/supabaseClient'

/**
 * Repositorio de Pagos
 * Maneja la lógica de acceso a datos de la tabla payments
 */

export async function createPayment(paymentData) {
    const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getPaymentsByUser(userId) {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getAllPayments() {
    const { data, error } = await supabase
        .from('payments')
        .select(`
      *,
      profiles:user_id (nombre, dni)
    `)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getPendingPayments() {
    const { data, error } = await supabase
        .from('payments')
        .select(`
      *,
      profiles:user_id (nombre, dni)
    `)
        .eq('estado', 'pending')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function updatePaymentStatus(paymentId, estado) {
    const { data, error } = await supabase
        .from('payments')
        .update({ estado })
        .eq('id', paymentId)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Sube comprobante de transferencia a Supabase Storage
 * Retorna la URL pública del archivo
 */
export async function uploadComprobante(file, userId) {
    const extension = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(fileName, file, { upsert: false })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(fileName)

    return urlData.publicUrl
}
