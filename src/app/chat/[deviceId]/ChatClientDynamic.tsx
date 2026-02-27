"use client";

import dynamic from 'next/dynamic'

const ChatClient = dynamic(() => import('./ChatClient'), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-screen">Loading...</div>
}) as React.ComponentType<{ userId: string; userEmail?: string; deviceId: string; deviceName: string }>;

export default ChatClient;
