'use client';

import 'swagger-ui-react/swagger-ui.css'
import SwaggerUI from 'swagger-ui-react'


type Props = {
    spec?: Record<string, any>,
    url?: string | undefined
}

function ReactSwagger({ spec, url }: Props) {
    if (process.env.NODE_ENV === 'development') {
        return <SwaggerUI spec={spec} />
    }

    else {
        return <SwaggerUI url={url} />
    }
}

export default ReactSwagger