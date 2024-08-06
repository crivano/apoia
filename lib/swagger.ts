import { createSwaggerSpec } from "next-swagger-doc"

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: "app/api", // define api folder under app folder
        definition: {
            openapi: "3.0.0",
            info: {
                title: "ApoIA API",
                version: "1.0",
            },
            tags: [
                { name: "auth" },
                { name: "ai" },
                { name: "batch" }
            ],
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWE",
                    },
                },
            },
            security: [],
        },
    })
    return spec
};