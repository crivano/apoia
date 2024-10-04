export type IAGenerated = {
    id: number
    model: string
    prompt: string
    sha256: string
    generation: string
}

export type IAGeneration = {
    model: string
    prompt: string
    sha256: string
    generation?: string
}

export type AIBatchIdAndEnumId = {
    dossier_code: string,
    enum_item_id: number,
    enum_item_descr: string,
    enum_item_descr_main: string | null,
    batch_dossier_id: number
}

export type AICountByBatchIdAndEnumId = {
    enum_item_id: number
    enum_item_descr: string
    hidden: number
    count: number
}

export type AIBatchDossierGeneration = {
    descr: string
    generation: string
    document_id: number
    document_code: string
    prompt: string
}

export type FindAIGeneratedParams = {
    batchName: string
    dossierCode: string
    documentCode: string
    sha256: string
    model: string
}

export type IABatchDossierItem = {
    batch_dossier_id: number
    document_id: number | null
    generation_id: number
    descr: string
    seq: number
}

export type IAEnumItem = {
    enum_id: number
    enum_descr: string
    enum_item_descr: string
    enum_item_hidden: number
    enum_item_descr_main: string | null
}

export type IADocument = {
    document_id: number
    dossier_id: number
    content_source_id: number
    code: string
    created_at: Date | null
    content: string
}

export type IAPrompt = {
    prompt_id: number
    base_prompt_id: number | null
    kind: string
    created_by: number | null
    name: string
    slug: string
    model_id: number,
    testset_id: number | null
    content: {
        system_prompt: string | null
        prompt: string | null
        json_schema: string | null
        format: string | null
    }
    created_at: Date | null
}

export type IAPromptToInsert = {
    base_prompt_id?: number
    kind: string
    name: string
    model_id: number
    testset_id: number | null
    content: {
        system_prompt?: string
        prompt: string | null
        json_schema?: string
        format?: string
    }
}

export type IATestset = {
    testset_id: number
    base_testset_id: number | null
    kind: string
    created_by: number | null
    name: string
    slug: string
    model_id: number
    content: {
        tests: [{
            name: string
            variables: [{
                name: string
                value: string
            }]
            texts: [{
                name: string
                value: string
            }]
            expected: string
            questions: [{
                question: string
            }]
        }]
    }
    created_at: Date | null
}

export type IATestsetToInsert = {
    base_testset_id: number | null
    kind: string
    created_by: number | null
    name: string
    model_id: number
    content: {
        tests: [{
            name: string
            variables: [{
                name: string
                value: string
            }]
            texts: [{
                name: string
                value: string
            }]
            expected: string
            questions: [{
                question: string
            }]
        }]
    }
}