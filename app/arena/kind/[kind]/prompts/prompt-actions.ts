'use server'

import { FormState, fromErrorToFormState, numericString } from '@/lib/form-support'
import { Dao } from '@/lib/mysql'
import test from 'node:test'
import z, { ZodError } from 'zod'

// import { redirect } from 'next/navigation'
// redirect(`/posts/${data.id}`)

const promptSchema = z.object({
    kind: z.string().min(1),
    name: z.string().min(1),
    model_id: numericString(z.number()),
    testset_id: numericString(z.number()).nullable(),
    content: z.object({
        system_prompt: z.string().nullable(),
        prompt: z.string().min(1),
        json_schema: z.string().nullable(),
        format: z.string().nullable()
    })
})

export const save = async (object: any) => {
    try {
        const data = promptSchema.parse(object)
        await Dao.insertIAPrompt(null, data as any)
        return { status: 'SUCCESS', message: 'success' }
    } catch (error) {
        return fromErrorToFormState(error)
    }
}

export const setOfficial = async (id: number) => {
    try {
        await Dao.setOfficialPrompt(null, id)
        return { status: 'SUCCESS', message: 'success' }
    } catch (error) {
        return fromErrorToFormState(error)
    }
}

export const removeOfficial = async (id: number) => {
    try {
        await Dao.removeOfficialPrompt(null, id)
        return { status: 'SUCCESS', message: 'success' }
    } catch (error) {
        return fromErrorToFormState(error)
    }
}
