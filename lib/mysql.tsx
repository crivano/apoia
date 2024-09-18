'use server'

const mysql = require("mysql2/promise")

const pool = process.env.MYSQL_HOST && mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    debug: false
})

const getConnection = async () => {
    return await pool.getConnection()
}


export interface IAGenerated {
    id: number
    model: string
    prompt: string
    sha256: string
    generation: string
}

export interface IAGeneration {
    model: string
    prompt: string
    sha256: string
    generation?: string
}

interface AIBatchIdAndEnumId {
    dossier_code: string,
    enum_item_id: number,
    enum_item_descr: string,
    enum_item_descr_main: string | null,
    batch_dossier_id: number
}

export const retrieveByBatchIdAndEnumId = async (batch_id: number, enum_id: number): Promise<AIBatchIdAndEnumId[]> => {
    const conn = await getConnection()
    try {
        let result
        [result] = await conn.query(`
            SELECT d.code dossier_code, d.class_code dossier_class_code, d.filing_at dossier_filing_at, ei.id enum_item_id, ei.descr enum_item_descr, ei2.descr enum_item_descr_main, bd.id batch_dossier_id FROM ia_batch b
            INNER JOIN ia_batch_dossier bd ON bd.batch_id = b.id
            INNER JOIN ia_dossier d ON d.id = bd.dossier_id
            LEFT JOIN ia_batch_dossier_enum_item bdei ON bdei.batch_dossier_id = bd.id
            LEFT JOIN ia_enum_item ei ON ei.id = bdei.enum_item_id
            LEFT JOIN ia_enum e ON e.id = ei.enum_id
            LEFT JOIN ia_enum_item ei2 ON ei2.id = ei.enum_item_id_main
            WHERE b.id = ? AND (e.id = 1 OR e.id is null)
            ORDER BY ei.descr, d.code
            `, [batch_id, enum_id])
        if (!result || result.length === 0) return []
        return result
    } catch (error) {
        throw new Error(`Error retrieving batch by enum: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

interface AICountByBatchIdAndEnumId {
    enum_item_id: number,
    enum_item_descr: string,
    hidden: number,
    count: number
}

export const retrieveCountByBatchIdAndEnumId = async (batch_id: number, enum_id: number): Promise<AICountByBatchIdAndEnumId[]> => {
    const conn = await getConnection()
    try {
        let result
        [result] = await conn.query(`
            SELECT ei.descr enum_item_descr, ei.hidden hidden, count(distinct bd.id) count FROM ia_batch b
            INNER JOIN ia_batch_dossier bd ON bd.batch_id = b.id
            INNER JOIN ia_dossier d ON d.id = bd.dossier_id
            INNER JOIN ia_batch_dossier_enum_item bdei ON bdei.batch_dossier_id = bd.id
            INNER JOIN ia_enum_item ei ON ei.id = bdei.enum_item_id
            INNER JOIN ia_enum e ON e.id = ei.enum_id
            WHERE b.id = ? AND e.id = ?
            GROUP BY ei.descr, ei.hidden
            ORDER BY count(distinct bd.id) desc
            `, [batch_id, enum_id])
        if (!result || result.length === 0) return []
        return result
    } catch (error) {
        throw new Error(`Error retrieving batch by enum: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

interface AIBatchDossierGeneration {
    descr: string,
    generation: string,
    document_id: number,
    document_code: string
}

export const retrieveGenerationByBatchDossierId = async (batch_dossier_id: number): Promise<AIBatchDossierGeneration[]> => {
    const conn = await getConnection()
    try {
        let result
        [result] = await conn.query(`
            SELECT bdi.descr, generation, d.id document_id, d.code document_code FROM apoia.ia_batch_dossier_item bdi 
            INNER JOIN ia_generation g ON g.id = bdi.generation_id
            LEFT OUTER JOIN ia_document d ON d.id = bdi.document_id
            WHERE batch_dossier_id = ? ORDER BY seq
            `, [batch_dossier_id])
        if (!result || result.length === 0) return []
        return result
    } catch (error) {
        throw new Error(`Error retrieving generation by batch_dossier_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}



export const retrieveIAGeneration = async (data: IAGeneration): Promise<IAGenerated | undefined> => {
    const { model, prompt, sha256 } = data

    if (!pool) return undefined

    const conn = await getConnection()
    try {
        let result
        [result] = await conn.query('SELECT * FROM ia_generation WHERE model = ? AND prompt = ? AND sha256 = ? AND evaluation_id is null', [model, prompt, sha256])
        if (!result || result.length === 0) return undefined
        const record: IAGenerated = result[0]
        return record
    } catch (error) {
        console.error('*** Error retrieving from ia_generation:', error?.message)
        throw new Error(`Error retrieving from ia_generation: ${error?.message}`)
    } finally {
        await conn.release()
    }

}


export const insertIAGeneration = async (data: IAGeneration): Promise<IAGenerated | undefined> => {
    const { model, prompt, sha256, generation } = data

    if (!pool) return undefined

    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Insert into ia_generation
        const query = `
          INSERT INTO ia_generation (model, prompt, sha256, generation)
          VALUES (?, ?, ?, ?)
          `
        await conn.query(query, [model, prompt, sha256, generation])
        conn.commit()
        const [insertResult] = await conn.query('SELECT * FROM ia_generation WHERE id = LAST_INSERT_ID()')
        const insertedRecord: IAGenerated = insertResult[0]
        return insertedRecord
    } catch (error) {
        await conn.rollback()
        console.error('*** Error inserting into ia_generation:', error?.message)
        throw new Error(`Error inserting into ia_generation: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

export const evaluateIAGeneration = async (user_id: number, generation_id: number, evaluation_id: number, evaluation_descr: string | null): Promise<boolean | undefined> => {
    if (!pool) return undefined

    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Insert into ia_generation
        const query = `
          UPDATE ia_generation SET evaluation_user_id = ?, evaluation_id = ?, evaluation_descr = ? WHERE id = ?
          `
        await conn.query(query, [user_id, evaluation_id, evaluation_descr, generation_id])
        conn.commit()
        return true
    } catch (error) {
        await conn.rollback()
        console.error('*** Error inserting into ia_generation:', error?.message)
        throw new Error(`Error inserting into ia_generation: ${error?.message}`)
    } finally {
        await conn.release()
    }
}



interface FindAIGeneratedParams {
    batchName: string
    dossierCode: string
    documentCode: string
    sha256: string
    model: string
}

export const assertIABatchId = async (batchName: string): Promise<number> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Check or insert batch
        let batch_id: number | null = null
        if (batchName) {
            let [batches] = await conn.query('SELECT id FROM ia_batch WHERE name = ?', [batchName])
            if (batches.length > 0) {
                batch_id = batches[0].id
            } else {
                const [batchResult] = await conn.query('INSERT INTO ia_batch (name) VALUES (?)', [batchName])
                batch_id = batchResult.insertId
            }
        }
        conn.commit()
        return batch_id as number
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error asserting batch_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

export const assertIADossierId = async (dossierCode: string, classCode: number, filingDate: Date): Promise<number> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Check or insert dossier
        let [dossiers] = await conn.query('SELECT id FROM ia_dossier WHERE code = ?', [dossierCode])
        let dossier_id: number
        if (dossiers.length > 0) {
            dossier_id = dossiers[0].id
        } else {
            const [dossierResult] = await conn.query('INSERT INTO ia_dossier (code, class_code, filing_at) VALUES (?,?,?)', [dossierCode, classCode, filingDate])
            dossier_id = dossierResult.insertId
        }
        conn.commit()
        return dossier_id as number
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error asserting dossier_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}
export const assertIADocumentId = async (documentCode: string, dossier_id: number): Promise<number> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Check or insert document
        let document_id: number | null = null
        if (documentCode) {
            let [documents] = await conn.query('SELECT id FROM ia_document WHERE code = ?', [documentCode])
            if (documents.length > 0) {
                document_id = documents[0].id
            } else {
                const [documentResult] = await conn.query('INSERT INTO ia_document (code, dossier_id) VALUES (?, ?)', [documentCode, dossier_id])
                document_id = documentResult.insertId
            }
        }
        conn.commit()
        return document_id as number
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error asserting document_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

export const assertIABatchDossierId = async (batch_id: number, dossier_id: number): Promise<number> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Check or insert document
        let batch_dossier_id: number | null = null
        let [documents] = await conn.query('SELECT id FROM ia_batch_dossier WHERE batch_id = ? AND dossier_id = ?', [batch_id, dossier_id])
        if (documents.length > 0) {
            batch_dossier_id = documents[0].id
        } else {
            const [documentResult] = await conn.query('INSERT INTO ia_batch_dossier (batch_id, dossier_id) VALUES (?, ?)', [batch_id, dossier_id])
            batch_dossier_id = documentResult.insertId
        }
        conn.commit()
        return batch_dossier_id as number
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error asserting batch_dossier_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

export const deleteIABatchDossierId = async (batch_id: number, dossier_id: number): Promise<undefined> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        let [documents] = await conn.query('DELETE FROM ia_batch_dossier WHERE batch_id = ? AND dossier_id = ?', [batch_id, dossier_id])
        conn.commit()
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error deleting batch_dossier: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

interface IABatchDossierItem {
    batch_dossier_id: number,
    document_id: number | null,
    generation_id: number,
    descr: string,
    seq: number
}

export const insertIABatchDossierItem = async (data: IABatchDossierItem): Promise<IAGenerated> => {
    const { batch_dossier_id, document_id, generation_id, descr, seq } = data

    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Insert into ia_generation
        const query = `
          INSERT INTO ia_batch_dossier_item (batch_dossier_id, document_id, generation_id, descr, seq)
          VALUES (?, ?, ?, ?, ?)
          `
        await conn.query(query, [batch_dossier_id, document_id, generation_id, descr, seq])
        conn.commit()
        const [insertResult] = await conn.query('SELECT * FROM ia_batch_dossier_item WHERE id = LAST_INSERT_ID()')
        const insertedRecord: IAGenerated = insertResult[0]
        return insertedRecord
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error inserting into ia_batch_dossier_item: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

export const assertIAEnumId = async (descr: string): Promise<number> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Check or insert batch
        let id: number | null = null
        if (descr) {
            let [batches] = await conn.query('SELECT id FROM ia_enum WHERE descr = ?', [descr])
            if (batches.length > 0) {
                id = batches[0].id
            } else {
                const [batchResult] = await conn.query('INSERT INTO ia_enum (descr) VALUES (?)', [descr])
                id = batchResult.insertId
            }
        }
        conn.commit()
        return id as number
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error asserting enum_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}
export const assertIAEnumItemId = async (descr: string, enum_id: number): Promise<number> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Check or insert document
        let id: number | null = null
        if (descr) {
            let [batches] = await conn.query('SELECT id FROM ia_enum_item WHERE descr = ? AND enum_id = ?', [descr, enum_id])
            if (batches.length > 0) {
                id = batches[0].id
            } else {
                const [batchResult] = await conn.query('INSERT INTO ia_enum_item (descr, enum_id) VALUES (?,?)', [descr, enum_id])
                id = batchResult.insertId
            }
        }
        conn.commit()
        return id as number
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error asserting enum_item_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

export const assertIABatchDossierEnumItemId = async (batch_dossier_id: number, enum_item_id: number): Promise<number> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Check or insert document
        let id: number | null = null
        let [batches] = await conn.query('SELECT id FROM ia_batch_dossier_enum_item WHERE batch_dossier_id = ? AND enum_item_id = ?', [batch_dossier_id, enum_item_id])
        if (batches.length > 0) {
            id = batches[0].id
        } else {
            const [batchResult] = await conn.query('INSERT INTO ia_batch_dossier_enum_item (batch_dossier_id, enum_item_id) VALUES (?,?)', [batch_dossier_id, enum_item_id])
            id = batchResult.insertId
        }
        conn.commit()
        return id as number
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error asserting ia_batch_dossier_enum_item_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

interface IAEnumItem {
    enum_id: number,
    enum_descr: string,
    enum_item_descr: string,
    enum_item_hidden: number,
    enum_item_descr_main: string | null
}


export const retrieveEnumItems = async (): Promise<IAEnumItem[]> => {
    const conn = await getConnection()
    try {
        let result
        [result] = await conn.query(`
            SELECT e.id enum_id, e.descr enum_descr, ei.descr enum_item_descr, ei.hidden enum_item_hidden, ei2.descr enum_item_descr_main
            from ia_enum e
            INNER JOIN ia_enum_item ei ON ei.enum_id = e.id
            LEFT JOIN ia_enum_item ei2 ON ei2.id = ei.enum_item_id_main
            ORDER BY e.id, ei.descr
            `, [])
        if (!result || result.length === 0) return []
        return result
    } catch (error) {
        throw new Error(`Error retrieving enum itens: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

export const assertIAUserId = async (username: string): Promise<number> => {
    // Start a transaction
    const conn = await getConnection()
    await conn.beginTransaction()

    try {
        // Check or insert batch
        let user_id: number | null = null
        if (username) {
            let [batches] = await conn.query('SELECT id FROM ia_user WHERE username = ?', [username])
            if (batches.length > 0) {
                user_id = batches[0].id
            } else {
                const [batchResult] = await conn.query('INSERT INTO ia_user (username) VALUES (?)', [username])
                user_id = batchResult.insertId
            }
        }
        conn.commit()
        return user_id as number
    } catch (error) {
        await conn.rollback()
        throw new Error(`Error asserting user_id: ${error?.message}`)
    } finally {
        await conn.release()
    }
}

