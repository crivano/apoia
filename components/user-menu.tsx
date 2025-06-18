'use server'

import authOptions from '../app/api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth';
import { NavDropdown, NavItem } from 'react-bootstrap';
import Link from 'next/link'
import UserMenuSignout from './user-menu-signout'
import { unstable_noStore as noStore } from 'next/cache'
import { NavigationLink } from './NavigationLink';
import { envString } from '@/lib/utils/env';
import { maiusculasEMinusculas, primeiroEUltimoNome } from '@/lib/utils/utils';
import WootricSurvey from './wootric-survey';
import { isUserCorporativo } from '@/lib/user';
import { getSelectedModelName, getSelectedModelParams } from '@/lib/ai/model-server';
import ErrorSpan from './error-span';
import Cryptr from 'cryptr';

export default async function UserMenu({ }: {}) {
    noStore()
    try {
        const session = await getServerSession(authOptions);
        // if (!session) return <NavItem>
        //     <NavigationLink href="/auth/signin" text="Login" />
        // </NavItem>

        const model = await getSelectedModelName()
        const user = session?.user
        const userCorporativo = user && !!await isUserCorporativo(user)
        const apiKeyProvided = !!(await getSelectedModelParams()).apiKey

        return (
            <ul className="navbar-nav me-1 mb-2x mb-lg-0x">
                {((envString('ACCESS_ARENA') || '').split(';').includes(user?.name) || user?.roles?.includes('apoia-role-arena')) &&
                    (<NavItem>
                        <NavigationLink href="/arena" text="Arena" />
                    </NavItem>)}
                <li className="nav-item dropdown">
                    {user
                        ?
                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {user?.image?.system ? `${user?.name}/${user?.image?.system}` : `${maiusculasEMinusculas(primeiroEUltimoNome(user?.name))}/PDPJ`}
                        </a>
                        : <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Configurações
                        </a>}
                    <ul className="dropdown-menu  dropdown-menu-end" aria-labelledby="navbarDropdown">
                        {!user && <li><Link className="dropdown-item" href="/auth/signin">Login</Link></li>}
                        <li><Link className="dropdown-item" href="/prefs">Modelo de IA{model && ` (${model})`}</Link></li>
                        {user && <li><UserMenuSignout /></li>}
                        {user && userCorporativo && apiKeyProvided && envString('WOOTRIC_ACCOUNT_TOKEN') && <WootricSurvey user={user} token={envString('WOOTRIC_ACCOUNT_TOKEN')} />}
                    </ul>
                </li>
            </ul>
        );
    } catch (error) {
        const cryptr = new Cryptr(envString('PROPERTY_SECRET') as string, {  })
        const encrypted = cryptr.encrypt(error.stack as string)
        return (
            <ul className="navbar-nav me-1 mb-2x mb-lg-0x">
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Configurações
                    </a>
                    <ul className="dropdown-menu  dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><Link className="dropdown-item" href="/prefs">Modelo de IA</Link></li>
                        <li className="dropdown-item"><ErrorSpan encrypted={encrypted} /></li>
                    </ul>
                </li>
            </ul>
        );
    }
}