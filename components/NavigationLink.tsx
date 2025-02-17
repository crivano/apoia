import Link from 'next/link'
// import { headers } from 'next/headers'

export const NavigationLink = (params: { href: string, text: string, className?: string }) => {
    // const headersList = headers()
    // const fullUrl = headersList.get('referer') || ""
    // const pathname = new URL(fullUrl).pathname
    let c = "nav-link me-3"
    if (params.className)
        c += params.className
    // if (pathname == params.href)
    //     c += " link-active"
    return (
        <Link href={params.href} className={c}>
            {params.text}
        </Link>
    )
}