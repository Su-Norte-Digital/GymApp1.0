import { supabase } from '../lib/supabaseClient'

/**
 * Repositorio de Notificaciones
 * Maneja avisos generales e individuales del gimnasio
 */

export async function getNotificationsForUser(userId) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`tipo.eq.general,and(tipo.eq.individual,target_user_id.eq.${userId})`)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getAllNotifications() {
    const { data, error } = await supabase
        .from('notifications')
        .select(`
      *,
      profiles:target_user_id (nombre)
    `)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createNotification(notificationData) {
    const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteNotification(notificationId) {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

    if (error) throw error
}

/**
 * Sube imagen de promoción a Supabase Storage
 * Retorna la URL pública del archivo
 */
export async function uploadPromoImage(file) {
    const extension = file.name.split('.').pop()
    const fileName = `promos/${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
        .from('notifications')
        .upload(fileName, file, { upsert: false })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
        .from('notifications')
        .getPublicUrl(fileName)

    return urlData.publicUrl
}
