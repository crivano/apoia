'use server'

import { hasApiKey } from '@/lib/ai/model-server'
import { Dao } from '@/lib/db/mysql'
import { assertCurrentUser } from '@/lib/user'
import { Contents } from './contents'

export default async function ServerContents() {
    const user = await assertCurrentUser()
    const apiKeyProvided = await hasApiKey()
    const user_id = await Dao.assertIAUserId(user.name)
    const prompts = await Dao.retrieveLatestPrompts(user_id)
    return <Contents prompts={prompts} user={user} user_id={user_id} apiKeyProvided={apiKeyProvided} />
}

