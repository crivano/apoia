'use server'

import authOptions from '../app/api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from "next/headers"
import { verify } from 'crypto'
import { verifyJweToken } from './utils/jwt'

export type UserType = {
    id?: number, name: string, email: string, preferredUsername?: string, iss?: string, image: { password: string, system: string }, accessToken?: string, corporativo?: any[], roles?: string[]
}

export const getCurrentUser = async (): Promise<UserType | undefined> => {
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

export const isUserCorporativo = (user: UserType) => {
    return !!user.corporativo || !!user.image?.system || process.env.NODE_ENV === 'development' || user.iss === 'https://sso.stg.cloud.pje.jus.br/auth/realms/pje';
}

export const assertCurrentUserCorporativo = async () => {
    const user = await assertCurrentUser()
    if (!isUserCorporativo(user))
        throw new Error('Usuário não é corporativo')
    return user
}

