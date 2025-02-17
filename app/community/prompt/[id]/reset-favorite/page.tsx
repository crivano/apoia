'use server'

import { unstable_noStore as noStore } from 'next/cache'
import { Dao } from '@/lib/db/mysql'
import { redirect } from 'next/navigation';
import { assertCurrentUser } from '@/lib/user'

export default async function Home({ params }: { params: { id: string } }) {
    noStore()
    const user = await assertCurrentUser()
    const user_id = await Dao.assertIAUserId(user.name)

    await Dao.resetFavorite(parseInt(params.id), user_id)

    redirect('/community/')
    return null
}