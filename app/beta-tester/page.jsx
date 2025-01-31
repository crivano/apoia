import React from 'react'
import AddCookieClient from './add-cookie-client'

export default async function Page() {
    return <div className="px-4 py-1 my-1 mt-5 text-center">
        <AddCookieClient />
        <a className='btn btn-success' href="/">Ir para a Home</a>
    </div>

}
