'use server'

import authOptions from '../app/api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from "next/headers"
import { verify } from 'crypto'
import { verifyJweToken } from './utils/jwt'

export const getCurrentUser = async (): Promise<{ id?: number, name: string, email: string, image: { password: string, system: string } } | undefined> => {
    const headersList = headers()
    const authorization = headersList.get("authorization")
    if (authorization) {
        const claims = await verifyJweToken(authorization)
        return { name: claims.name, email: claims.name, image: { password: claims.password, system: claims.system } }
    }

    const session = await getServerSession(authOptions)
    if (!session) {
        return undefined
    }
    const user = session.user
    return user
}

export const assertCurrentUser = async () => {
    const user = await getCurrentUser()
    if (!user) redirect('/auth/signin')
    return user
}

