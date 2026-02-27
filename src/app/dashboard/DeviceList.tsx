'use client'

import { useState, useEffect } from 'react'
import { createDevice, deleteDevice, type DeviceKey } from './actions'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/SubmitButton'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Copy,
    KeyRound,
    MonitorSmartphone,
    Play,
    Trash2,
    Eye,
    EyeOff,
    Laptop,
    Monitor,
    Terminal,
    Wifi,
    WifiOff,
    CheckCircle2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * 判断设备是否在线（last_seen_at 距现在 < 60s）
 */
function isDeviceOnline(lastSeenAt: string | null): boolean {
    if (!lastSeenAt) return false
    const diff = Date.now() - new Date(lastSeenAt).getTime()
    return diff < 60_000
}

/**
 * 获取 OS 图标
 */
function OsIcon({ osType }: { osType: string | null }) {
    if (!osType) return <MonitorSmartphone className="h-6 w-6" style={{ color: '#8B8FA3' }} />
    const lower = osType.toLowerCase()
    if (lower.includes('mac') || lower.includes('darwin')) {
        return <Laptop className="h-6 w-6" style={{ color: '#1A1D23' }} />
    }
    if (lower.includes('win')) {
        return <Monitor className="h-6 w-6" style={{ color: '#c4934a' }} />
    }
    if (lower.includes('linux')) {
        return <Terminal className="h-6 w-6" style={{ color: '#a87a3a' }} />
    }
    return <MonitorSmartphone className="h-6 w-6" style={{ color: '#8B8FA3' }} />
}

/**
 * 在线/离线状态标签
 */
function StatusBadge({ online }: { online: boolean }) {
    if (online) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(196, 147, 74, 0.12)', color: '#a87a3a' }}>
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#c4934a' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#c4934a' }} />
                </span>
                在线
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: '#F0F1F4', color: '#8B8FA3' }}>
            <WifiOff className="h-3 w-3" />
            离线
        </span>
    )
}

export function DeviceList({ initialDevices }: { initialDevices: DeviceKey[] }) {
    const [devices, setDevices] = useState(initialDevices)
    const [isOpen, setIsOpen] = useState(false)
    const [newKeyData, setNewKeyData] = useState<{ name: string, key: string } | null>(null)
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
    const [copied, setCopied] = useState(false)
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [navigatingId, setNavigatingId] = useState<string | null>(null)
    const router = useRouter()

    // 当 server 端重新渲染后 initialDevices 更新时，同步到 client state
    useEffect(() => {
        setDevices(initialDevices)
    }, [initialDevices])

    // 每 10 秒自动刷新设备状态（在线/离线、设备信息）
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh()
        }, 10_000)
        return () => clearInterval(interval)
    }, [router])

    const handleCreate = async (formData: FormData) => {
        try {
            const res = await createDevice(formData)
            setNewKeyData({ name: res.deviceName, key: res.apiKey })
            setIsOpen(false)
            // 从服务端重新拉取最新设备列表（避免乐观更新导致重复）
            router.refresh()
        } catch (e: any) {
            alert(e.message)
        }
    }

    const handleDelete = async () => {
        if (!confirmingDeleteId) return
        setDeletingId(confirmingDeleteId)
        try {
            await deleteDevice(confirmingDeleteId)
            setDevices(devices.filter(d => d.id !== confirmingDeleteId))
            setConfirmingDeleteId(null)
        } catch (e: any) {
            alert(e.message)
        } finally {
            setDeletingId(null)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const toggleKeyVisibility = (deviceId: string) => {
        setVisibleKeys(prev => {
            const next = new Set(prev)
            if (next.has(deviceId)) {
                next.delete(deviceId)
            } else {
                next.add(deviceId)
            }
            return next
        })
    }

    return (
        <div className="grid gap-6">

            {/* Action Bar */}
            <div className="flex justify-end">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <KeyRound className="h-4 w-4" />
                            新增设备 / 生成 Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>添加新设备</DialogTitle>
                            <DialogDescription>
                                为你的本地电脑生成一条独一无二的 API 通信凭证。
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="deviceName" className="text-right">
                                        设备名称
                                    </Label>
                                    <Input
                                        id="deviceName"
                                        name="deviceName"
                                        placeholder="如: 家里的 iMac"
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <SubmitButton type="submit">生成 API Key</SubmitButton>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* 新建成功后的 Key 弹窗 */}
            <Dialog open={!!newKeyData} onOpenChange={(open) => { if (!open) setNewKeyData(null) }}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            秘钥生成成功: {newKeyData?.name}
                        </DialogTitle>
                        <DialogDescription>
                            请妥善保管此 Key。将它填入本地 Sootie 客户端的 WebIM 配置 → Device API Key 中。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2 py-2">
                        <Input value={newKeyData?.key || ''} readOnly className="font-mono text-sm" style={{ background: '#F3F4F6' }} />
                        <Button
                            onClick={() => newKeyData && copyToClipboard(newKeyData.key)}
                            variant={copied ? "default" : "secondary"}
                            className="shrink-0 gap-1.5"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? '已复制' : '复制'}
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewKeyData(null)}>关闭</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 删除确认弹窗 */}
            <AlertDialog open={confirmingDeleteId !== null} onOpenChange={(open) => !open && !deletingId && setConfirmingDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除该设备吗？</AlertDialogTitle>
                        <AlertDialogDescription>
                            删除此设备后，它将无法再与云端同步，之前分配的 API Key 将立刻失效并且无法恢复。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setConfirmingDeleteId(null)} disabled={!!deletingId}>
                            取消
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} loading={!!deletingId}>
                            确认删除
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 设备卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => {
                    const online = isDeviceOnline(device.last_seen_at)
                    const keyVisible = visibleKeys.has(device.id)

                    return (
                        <Card key={device.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    {/* OS 图标 */}
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg shrink-0"
                                        style={{ background: online ? 'rgba(196, 147, 74, 0.1)' : '#F0F1F4' }}>
                                        <OsIcon osType={device.os_type} />
                                    </div>

                                    {/* 名称 + 状态 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-base truncate">{device.device_name}</CardTitle>
                                            <StatusBadge online={online} />
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: '#8B8FA3' }}>
                                            {device.hostname
                                                ? <span className="font-medium" style={{ color: '#6B7280' }}>{device.hostname}</span>
                                                : <span>等待设备连接...</span>
                                            }
                                            {device.os_type && (
                                                <span className="ml-2" style={{ color: '#8B8FA3' }}>· {device.os_type}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 删除按钮 */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 h-8 w-8 hover:bg-red-50 hover:text-red-500"
                                        style={{ color: '#8B8FA3' }}
                                        onClick={() => setConfirmingDeleteId(device.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-3 pt-0">
                                {/* 设备信息 */}
                                <div className="text-xs flex items-center justify-between" style={{ color: '#8B8FA3' }}>
                                    <span>创建于 {formatDate(device.created_at)}</span>
                                    {device.last_seen_at && (
                                        <span>最后心跳 {formatTimeAgo(device.last_seen_at)}</span>
                                    )}
                                </div>

                                {/* API Key 查看区域 */}
                                <div className="rounded-lg p-2.5" style={{ background: '#F3F4F6', border: '1px solid #E0E2E7' }}>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 text-xs font-mono truncate" style={{ color: '#1A1D23' }}>
                                            {keyVisible ? device.api_key : `sk_${'•'.repeat(24)}`}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            style={{ color: '#6B7280' }}
                                            onClick={() => toggleKeyVisibility(device.id)}
                                        >
                                            {keyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            style={{ color: '#6B7280' }}
                                            onClick={() => copyToClipboard(device.api_key)}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>

                            {/* 进入对话按钮 */}
                            <div className="p-4 pt-0 mt-auto">
                                <Button
                                    onClick={() => {
                                        setNavigatingId(device.id)
                                        router.push(`/chat/${device.device_id}`)
                                    }}
                                    className="w-full gap-2"
                                    variant={online ? "default" : "outline"}
                                    disabled={!online}
                                    loading={navigatingId === device.id}
                                >
                                    {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                                    {online ? '进入对话' : '设备未上线'}
                                </Button>
                            </div>
                        </Card>
                    )
                })}

                {devices.length === 0 && (
                    <div className="col-span-full py-20 text-center rounded-xl"
                        style={{ color: '#8B8FA3', border: '2px dashed #E0E2E7' }}>
                        <KeyRound className="mx-auto h-12 w-12 mb-4" style={{ color: '#c4934a', opacity: 0.4 }} />
                        还没有绑定任何设备。首先尝试生成一个 API Key 吧！
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * 格式化"多久前"
 */
function formatTimeAgo(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime()
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds}秒前`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    return `${days}天前`
}

/**
 * 格式化稳定的日期 YYYY-MM-DD (防止 Client/Server Hydration 报错)
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}
