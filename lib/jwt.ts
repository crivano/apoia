import * as jose from 'jose'
import { SHA256 } from 'crypto-js'

const buildJwt = async (system: string, name: string, password: string) => {
  const jwtsecret = new TextEncoder().encode(process.env.JWT_SECRET)
  const alg = 'HS256'
  const jwt = await new jose.SignJWT({ system, name, password })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(process.env.JWT_ISSUER as string)
    .setAudience(process.env.JWT_AUDIENCE as string)
    .setExpirationTime('2h')
    .sign(jwtsecret)
  return jwt
}

async function sha256(message: string): Promise<Uint8Array> {
  // Converte a string em um array de bytes (Uint8Array)
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Gera o hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Converte o ArrayBuffer em um Uint8Array
  const hashArray = new Uint8Array(hashBuffer);

  return hashArray;
}

export const buildJweToken = async (claims: any) => {
  const secret = await sha256(process.env.JWT_SECRET as string)

  const jwt = await buildJwt(claims.system, claims.name, claims.password)

  const jwtEncoded = new TextEncoder().encode(jwt)
  const jwe = await new jose.CompactEncrypt(jwtEncoded)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .encrypt(secret)

  return jwe
}

interface TokenClaims { name: string, password: string, system: string }

export const verifyJweToken = async (token: string): Promise<TokenClaims> => {
  const secret = await sha256(process.env.JWT_SECRET as string)
  const jwtsecret = new TextEncoder().encode(process.env.JWT_SECRET)

  // jwe is token without the "Bearer " prefix
  const jwe = token.replace('Bearer ', '')

  const { plaintext: jwt } = await jose.compactDecrypt(jwe, secret)

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, jwtsecret, {
    issuer: process.env.JWT_ISSUER as string,
    audience: process.env.JWT_AUDIENCE as string,
  })

  return payload as unknown as TokenClaims
}