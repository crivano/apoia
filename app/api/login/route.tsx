import Fetcher from '../../../lib/fetcher'
import * as jose from 'jose'
import { NextResponse } from 'next/server'
import { autenticar } from '../../../lib/mni'
import { encrypt } from '@/lib/crypt'
import { buildJweToken } from '@/lib/jwt'

export async function POST(request: Request) {
    try {
        // const body = JSON.parse(JSON.stringify(request.body))
        const body = await request.json()
        const autenticado = await autenticar(body.system, body.email, body.password)

        if (!autenticado)
            throw new Error('Usuário ou senha inválidos')

        const password = encrypt(body.password)
        const resp: any = { name: body.email, email: body.email, image: { password, system: body.system } }

        // const token = await buildJweToken({ name: body.email, password, system: body.system })
        // resp.token = token

        return NextResponse.json(resp, { status: 200 });
    } catch (error) {
        const message = Fetcher.processError(error)
        return NextResponse.json({ message: `${message}` }, { status: 405 });
    }
};
