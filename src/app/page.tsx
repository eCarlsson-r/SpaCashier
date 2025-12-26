'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function Page() {
    const router = useRouter()

    useEffect(() => {
        const token = Cookies.get('auth_token')
        if (token) {
            router.push('/dashboard')
        } else {
            router.push('/login')
        }
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-sky-600 font-medium">
                Loading Spa Information System...
            </div>
        </div>
    )
}