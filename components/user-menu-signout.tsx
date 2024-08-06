'use client'

import Link from 'next/link'
import { signOut } from "next-auth/react"

export default function UserMenu() {
    const logout = () => {
        // document.cookie = "model=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        signOut()
    }

    return (<button className="dropdown-item" onClick={() => logout()}>Logout</button>)
}