'use client'

import { signIn } from "next-auth/react"

const Provider = (params) => {
    return (
        <div style={{ marginBottom: 0 }}>
            <a href="#" onClick={() => signIn(params.id)}>
                <span>Acessar com {params.name}</span>
            </a>
        </div>
    )
}

export default Provider