'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export type DeviceKey = {
    id: string
    device_id: string
    device_name: string
    api_key: string
    created_at: string
    last_used_at: string | null
    os_type: string | null
    hostname: string | null
    last_seen_at: string | null
}

export async function getDevices(): Promise<DeviceKey[]> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
        .from('device_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch devices:', error)
        return []
    }

    return data as DeviceKey[]
}

export async function createDevice(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const deviceName = formData.get('deviceName') as string
    if (!deviceName) {
        throw new Error('Device name is required')
    }

    const deviceId = uuidv4()
    const apiKey = `sk_${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '').substring(0, 16)}`

    const { error } = await supabase.from('device_keys').insert({
        user_id: user.id,
        device_id: deviceId,
        device_name: deviceName,
        api_key: apiKey,
    })

    if (error) {
        console.error('Failed to create device:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')

    return { apiKey, deviceId, deviceName }
}

export async function deleteDevice(deviceId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('device_keys')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to delete device:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
}
