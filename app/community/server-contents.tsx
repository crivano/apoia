'use server'

import { hasApiKey } from '@/lib/ai/model-server'
import { Dao } from '@/lib/db/mysql'
import { assertCurrentUser, isUserCorporativo, UserType } from '@/lib/user'
import { Contents } from './contents'
import { Container } from 'react-bootstrap'

export default async function ServerContents() {
    const user = await assertCurrentUser()
    if (!await isUserCorporativo(user))
        return <Container><div className="alert alert-danger mt-5">Usuário não é corporativo</div></Container>
    const apiKeyProvided = await hasApiKey()
    const user_id = await Dao.assertIAUserId(user.name)
    const prompts = await Dao.retrieveLatestPrompts(user_id)
    return <Contents prompts={prompts} user={user} user_id={user_id} apiKeyProvided={apiKeyProvided} />
}

