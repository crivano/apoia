'use server'

import { getSelectedModelParams } from '@/lib/ai/model-server'
import { Dao } from '@/lib/db/mysql'
import { assertCurrentUser, isUserCorporativo, isUserModerator, UserType } from '@/lib/user'
import { Contents } from './contents'
import { Container } from 'react-bootstrap'
import { cookies } from 'next/headers'

export default async function ServerContents() {
    const user = await assertCurrentUser()
    if (!(await isUserCorporativo(user)))
        return <Container><div className="alert alert-danger mt-5">Usuário não é corporativo</div></Container>

    const { model, apiKey } = await getSelectedModelParams()

    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    const prompts = await Dao.retrieveLatestPrompts(user_id, await isUserModerator(user))

    const listPublicPromptsCookie = !!(await cookies()).get('list-public-prompts')?.value

    return <Contents prompts={prompts} user={user} user_id={user_id} apiKeyProvided={!!apiKey} model={model} listPublicPromptsCookie={listPublicPromptsCookie} />
}

