import { getDevices } from './actions'
import { DeviceList } from './DeviceList'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { signout } from '../login/actions'
import { SubmitButton } from '@/components/SubmitButton'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const devices = await getDevices()
    const { data: wechatAccount } = await supabase
        .from('wechat_accounts')
        .select('nickname, avatar_url')
        .eq('auth_user_id', user.id)
        .maybeSingle()

    const displayName = wechatAccount?.nickname || user.user_metadata?.display_name || user.email
    const avatarUrl = wechatAccount?.avatar_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/9.x/lorelei/svg?seed=${user.email}`

    return (
        <div className="flex min-h-screen w-full flex-col" style={{ background: '#F8F9FB' }}>
            {/* 顶栏 */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 px-6"
                style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #E0E2E7',
                }}>
                <div className="flex items-center gap-3 font-semibold text-lg">
                    <Link href="/" className="flex items-center gap-3" prefetch={false}>
                        <Image src="/sootie-logo-transparent.png" alt="Sootie" width={32} height={32} />
                        <span style={{ color: '#1A1D23' }}>Sootie Cloud</span>
                    </Link>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full bg-[#F3F4F6] border border-[#E0E2E7] shadow-sm object-cover"
                        />
                        <span className="text-sm font-medium" style={{ color: '#1A1D23' }}>{displayName}</span>
                    </div>
                    <form action={signout}>
                        <SubmitButton
                            variant="outline"
                            className="h-8 gap-1.5 border-[#E0E2E7] text-[#6B7280]"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            退出
                        </SubmitButton>
                    </form>
                </div>
            </header>

            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1A1D23' }}>
                            我的设备面板
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
                            统一管理您在各处的机器设备凭证。获取密钥并在本地 Sootie 应用绑定后，即可在云端 Web UI 与本地 Sootie 聊天、下发任务指令
                        </p>
                    </div>
                </div>

                <DeviceList initialDevices={devices} />
            </main>
        </div>
    )
}
