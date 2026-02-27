import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatClientDynamic from './ChatClientDynamic'

export default async function ChatPage({
    params,
}: {
    params: Promise<{ deviceId: string }>
}) {
    // Next.js 15 route params are Promises
    const resolvedParams = await params
    const { deviceId } = resolvedParams

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify if the device belongs to the user
    const { data: devices } = await supabase
        .from('device_keys')
        .select('device_name')
        .eq('device_id', deviceId)
        .eq('user_id', user.id)
        .single()

    if (!devices) {
        redirect('/dashboard')
    }

    return (
        <ChatClientDynamic userId={user.id} userEmail={user.email} deviceId={deviceId} deviceName={devices.device_name} />
    )
}
