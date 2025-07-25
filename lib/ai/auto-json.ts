// Tipo para representar as variáveis do prompt
export type PromptVariableType = {
    separatorName?: string // Nome do separador, se houver
    name: string
    label?: string
    type: 'object' | 'string' | 'number' | 'boolean' | 'date' | 'string-long'
    description: string
    properties?: PromptVariableType[]
}

// Função para extrair a estrutura de variáveis do markdown
export const parsePromptVariablesFromMarkdown = (md: string): PromptVariableType[] | undefined => {
    // Primeiro, tenta o formato padrão com instruções JSON
    const jsonInstructionsRegex = /^## Instruções para o Preenchimento do JSON de Resposta\s*$/gms;
    const jsonParts = md.split(jsonInstructionsRegex)

    if (jsonParts.length < 2) return undefined

    // Formato padrão com instruções JSON
    let instructionsMd = jsonParts[1]

    // Find the end of the JSON instructions
    const endRegex = /(?:^##? .+\s*)$/gms;
    const endParts = instructionsMd.split(endRegex)
    instructionsMd = endParts[0]

    const typeFromName = (name: string): 'object' | 'string' | 'number' | 'boolean' | 'date' | 'string-long' => {
        if (/^Dt[A-Z0-9_]/.test(name)) return 'date'
        if (/^Ev[A-Z0-9_]/.test(name)) return 'string'
        if (/^Nr[A-Z0-9_]/.test(name)) return 'number'
        if (/^Lo[A-Z0-9_]/.test(name)) return 'boolean'
        if (/^Tx[A-Z0-9_]/.test(name)) return 'string-long'
        if (name.toLowerCase().includes('texto') || name.toLowerCase().includes('resumo') || name.toLowerCase().includes('conclusão')) return 'string-long'
        return 'string'
    }

    // Read every line of the JSON instructions. If it is a level 3 header, add it to the variables, if it is a level 5 header, add it to the properties of the last variable
    const lines = instructionsMd.split('\n')
    const variables: PromptVariableType[] = []
    let currentVariable: PromptVariableType | null = null

    for (const line of lines) {
        const level3Header = line.match(/^(### )(?<name>[^\s]+)$/)
        const level6Header = line.match(/^(###### )(?<name>[^\s]+)(?:\s+-\s+(?<label>[^\s].+[^\s])\s*)$/)
        const description = line.match(/^(?!#{1,6}\s)[^\s].*$/)

        if (level3Header) {
            const name = level3Header.groups.name
            currentVariable = {
                name,
                type: typeFromName(name),
                description: ''
            }
            variables.push(currentVariable)
        } else if (level6Header && currentVariable) {
            const name = level6Header.groups.name
            const label = level6Header.groups.label
            if (!currentVariable.properties) currentVariable.properties = []
            currentVariable.properties.push({
                name,
                label,
                type: typeFromName(name),
                description: ''
            })
            currentVariable.type = 'object' // Se tem propriedades, é um objeto
        } else if (description && currentVariable) {
            // Captura a descrição da variável atual
            if (!currentVariable.description && line.trim()) {
                currentVariable.description = line.trim()
            }
        }
    }

    // Garante que todas as variáveis tenham pelo menos o nome como descrição
    variables.forEach(variable => {
        if (!variable.description) {
            variable.description = variable.name
        }
    })

    return variables
}

export const flatternPromptVariables = (variables: PromptVariableType[]): PromptVariableType[] => {
    if (!variables || variables.length === 0) return []

    const flattern = variables.flatMap(variable => {
        if (variable.type === 'object' && variable.properties && variable.properties.length > 0) {
            variable.properties[0].separatorName = variable.name
            return Object.values(variable.properties)
        }
        return variable
    })
    console.log(`Flattened variables: ${JSON.stringify(flattern, null, 2)}`)
    return flattern
}

const mapTypeToJsonSchema = (type: string): string => {
    switch (type) {
        case 'date':
            return 'string' // Dates are usually represented as strings in JSON
        case 'string-long':
            return 'string'
    }
    return type // For other types, return as is
}

export const promptJsonSchemaFromPromptMarkdown = (md: string): string | undefined => {
    let variables = flatternPromptVariables(parsePromptVariablesFromMarkdown(md))

    if (!variables || variables.length === 0) return undefined

    // Converte as variáveis para o formato do JSON Schema
    const properties: Record<string, any> = {}
    for (const variable of variables) {
        const variableSchema: any = { type: mapTypeToJsonSchema(variable.type), description: variable.description, additionalProperties: false }
        if (variable.properties && Object.keys(variable.properties).length > 0) {
            variableSchema.properties = {}
            for (const [propName, prop] of Object.entries(variable.properties)) {
                variableSchema.properties[propName] = {
                    type: mapTypeToJsonSchema(prop.type),
                    description: prop.description
                }
            }
        }
        properties[variable.name] = variableSchema
    }

    const schema = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "additionalProperties": false,
        "properties": properties
    }

    const addRequiredFields = (obj: any) => {
        if (obj.type === 'object' && obj.properties) {
            const requiredProperties = Object.keys(obj.properties);
            if (requiredProperties.length > 0) {
                obj.required = requiredProperties;
            }
            for (const key in obj.properties) {
                addRequiredFields(obj.properties[key]);
            }
        }
    };

    addRequiredFields(schema);

    const json = JSON.stringify(schema, null, 2)
    console.log(`JSON Schema gerado: ${json}`)
    return json
}

