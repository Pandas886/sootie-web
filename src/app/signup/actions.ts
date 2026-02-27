'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // 服务端密码一致性校验
    if (password !== confirmPassword) {
        redirect('/signup?error=true')
    }

    // 密码长度校验
    if (password.length < 6) {
        redirect('/signup?error=true')
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        redirect('/signup?error=true')
    }

    revalidatePath('/', 'layout')
    // 注册成功后跳转到登录页并显示成功提示
    redirect('/login?registered=true')
}
