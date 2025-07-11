'use client'

import { signOut } from "next-auth/react"

export default function LayoutLogout() {
    const logout = () => {
        signOut()
    }

    return (<span className="alert-link" style={{ textDecoration: 'underline' }} onClick={() => logout()}>faça o login utilizando CPF e senha</span>)
}