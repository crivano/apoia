'use client'

import { addBetaTesterCookie } from "@/app/beta-tester/add-cookie";
import { useEffect } from "react";

export default function AddCookieClient() {
    useEffect(() => {
        addBetaTesterCookie()
    }, [])
    return <p>Permissões de beta tester implantadas!</p>
}