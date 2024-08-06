'use client'
import { useEffect } from "react";

export default function ImportBsJS() {
    useEffect(() => {
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);
    return null;
}