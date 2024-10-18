'use server'

import authOptions from '../app/api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth';
import { NavDropdown, NavItem } from 'react-bootstrap';
import Link from 'next/link'
import UserMenuSignout from './user-menu-signout'
import { unstable_noStore as noStore } from 'next/cache'
import { getModelAndApiKeyCookieValue } from '../app/model/cookie';
import { NavigationLink } from './NavigationLink';


export default async function UserMenu() {
    noStore()
    const session = await getServerSession(authOptions);
    if (!session) return <><Link href="/auth/signin">Login</Link></>

    const { model, apiKey, automatic } = getModelAndApiKeyCookieValue()

    const user = session.user
    return (
        <ul className="navbar-nav me-1 mb-2x mb-lg-0x">
            {(process.env.ACCESS_ARENA || '').split(';').includes(user.name) &&
                (<NavItem>
                    <NavigationLink href="/arena" text="Arena" />
                </NavItem>)}
            <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {user.name}/{user.image.system}
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><Link className="dropdown-item" href="/model">Modelo de IA{!automatic && ` (${model})`}</Link></li>
                    <li><UserMenuSignout /></li>
                </ul>
            </li>
        </ul>
    );
}