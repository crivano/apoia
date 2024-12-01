'use server'

import authOptions from '../app/api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth';
import { NavDropdown, NavItem } from 'react-bootstrap';
import Link from 'next/link'
import UserMenuSignout from './user-menu-signout'
import { unstable_noStore as noStore } from 'next/cache'
import { getPrefs } from '../lib/utils/prefs';
import { NavigationLink } from './NavigationLink';


export default async function UserMenu() {
    noStore()
    const session = await getServerSession(authOptions);
    // if (!session) return <NavItem>
    //     <NavigationLink href="/auth/signin" text="Login" />
    // </NavItem>

    const byCookie = getPrefs()
    const model = byCookie?.model

    const user = session?.user
    return (
        <ul className="navbar-nav me-1 mb-2x mb-lg-0x">
            {((process.env.ACCESS_ARENA || '').split(';').includes(user?.name) || user?.roles?.includes('apoia-role-arena')) &&
                (<NavItem>
                    <NavigationLink href="/arena" text="Arena" />
                </NavItem>)}
            <li className="nav-item dropdown">
                {user
                    ?
                    <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {user?.name}{user?.image?.system ? `/${user?.image?.system}` : '/PDPJ'}
                    </a>
                    : <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Configurações
                    </a>}
                <ul className="dropdown-menu  dropdown-menu-end" aria-labelledby="navbarDropdown">
                    {!user && <li><Link className="dropdown-item" href="/auth/signin">Login</Link></li>}
                    <li><Link className="dropdown-item" href="/prefs">Modelo de IA{model && ` (${model})`}</Link></li>
                    {user && <li><UserMenuSignout /></li>}
                </ul>
            </li>
        </ul>
    );
}