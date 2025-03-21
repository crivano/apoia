'use server'

import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/db/mysql'
import { redirect } from 'next/navigation';
import { assertCurrentUser } from '@/lib/user'
import { envString } from '@/lib/utils/env';

export default async function Home({ params }: { params: { id: string } }) {
    noStore()
    const user = await assertCurrentUser()
    const user_id = await Dao.assertIAUserId(user.preferredUsername || user.name)
    if (envString('MODERATOR') && user.preferredUsername && envString('MODERATOR').split(',').includes(user.preferredUsername))
        await Dao.setPrivate(parseInt(params.id))
    redirect('/community')
    return null
}