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

interface AICountByBatchIdAndEnumId {
    enum_item_id: number
    enum_item_descr: string
    hidden: number
    count: number
}

interface AIBatchDossierGeneration {
    descr: string
    generation: string
    document_id: number
    document_code: string
    prompt: string
}

interface FindAIGeneratedParams {
    batchName: string
    dossierCode: string
    documentCode: string
    sha256: string
    model: string
}

interface IABatchDossierItem {
    batch_dossier_id: number
    document_id: number | null
    generation_id: number
    descr: string
    seq: number
}

interface IAEnumItem {
    enum_id: number
    enum_descr: string
    enum_item_descr: string
    enum_item_hidden: number
    enum_item_descr_main: string | null
}

interface IADocument {
    document_id: number
    dossier_id: number
    content_source_id: number
    code: string
    created_at: Date | null
    content: string
}

function con(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        if (!pool) return undefined
        const conn = await getConnection()
        if (args.length > 0 && args[0] === null) args[0] = conn
        try {
            const result = await original.apply(this, args);
            return result
        } catch (error) {
            console.error(`*** Dao error on ${propertyKey}:`, error?.message)
            throw new Error(`Dao error on ${propertyKey}: ${error?.message}`)
        } finally {
            await conn.release()
        }
    }
}

function tran(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        if (!pool) return undefined
        const conn = await getConnection()
        await conn.beginTransaction()
        if (args.length > 0 && args[0] === null) args[0] = conn
        try {
            const result = await original.apply(this, args);
            await conn.commit()
            return result
        } catch (error) {
            await conn.rollback()
            console.error(`*** Dao error on ${propertyKey}:`, error?.message)
            throw new Error(`Dao error on ${propertyKey}: ${error?.message}`)
        } finally {
            await conn.release()
        }
    }
}

export class Dao {

    @con
    static async retrieveIAGeneration(conn: any, data: IAGeneration): Promise<IAGenerated | undefined> {
        const { model, prompt, sha256 } = data
        let result
        [result] = await conn.query('SELECT * FROM ia_generation WHERE model = ? AND prompt = ? AND sha256 = ? AND evaluation_id is null', [model, prompt, sha256])
        if (!result || result.length === 0) return undefined
        const record: IAGenerated = result[0]
        return record
    }

    @con
    static async retrieveByBatchIdAndEnumId(conn: any, batch_id: number, enum_id: number): Promise<AIBatchIdAndEnumId[]> {
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
    }

    @con
    static async retrieveCountByBatchIdAndEnumId(conn: any, batch_id: number, enum_id: number): Promise<AICountByBatchIdAndEnumId[]> {
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
    }

    @con
    static async retrieveGenerationByBatchDossierId(conn: any, batch_dossier_id: number): Promise<AIBatchDossierGeneration[]> {
        let result
        [result] = await conn.query(`
            SELECT bdi.descr, g.generation, g.prompt, d.id document_id, d.code document_code FROM apoia.ia_batch_dossier_item bdi 
            INNER JOIN ia_generation g ON g.id = bdi.generation_id
            LEFT OUTER JOIN ia_document d ON d.id = bdi.document_id
            WHERE batch_dossier_id = ? ORDER BY seq
            `, [batch_dossier_id])
        if (!result || result.length === 0) return []
        return result
    }

    @tran
    static async insertIAGeneration(conn: any, data: IAGeneration): Promise<IAGenerated | undefined> {
        const { model, prompt, sha256, generation } = data

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
    }

    @tran
    static async evaluateIAGeneration(conn: any, user_id: number, generation_id: number, evaluation_id: number, evaluation_descr: string | null): Promise<boolean | undefined> {
        // Insert into ia_generation
        const query = `
          UPDATE ia_generation SET evaluation_user_id = ?, evaluation_id = ?, evaluation_descr = ? WHERE id = ?
          `
        await conn.query(query, [user_id, evaluation_id, evaluation_descr, generation_id])
        return true
    }

    @tran
    static async assertSystemId(conn: any, code: string): Promise<number> {
        // Check or insert batch
        let id: number | null = null
        if (code) {
            let [batches] = await conn.query('SELECT id FROM ia_system WHERE code = ?', [code])
            if (batches.length > 0) {
                id = batches[0].id
            } else {
                const [batchResult] = await conn.query('INSERT INTO ia_system (code) VALUES (?)', [code])
                id = batchResult.insertId
            }
        }
        return id as number
    }



    @tran
    static async assertIABatchId(conn: any, batchName: string): Promise<number> {
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
        return batch_id as number
    }

    @tran
    static async assertIADossierId(conn: any, dossierCode: string, systemId: number, classCode: number, filingDate: Date): Promise<number> {
        // Check or insert dossier
        let [dossiers] = await conn.query('SELECT id FROM ia_dossier WHERE code = ? and system_id = ?', [dossierCode, systemId])
        let dossier_id: number
        if (dossiers.length > 0) {
            dossier_id = dossiers[0].id
        } else {
            const [dossierResult] = await conn.query('INSERT INTO ia_dossier (system_id, code, class_code, filing_at) VALUES (?,?,?,?)', [systemId, dossierCode, classCode, filingDate])
            dossier_id = dossierResult.insertId
        }
        return dossier_id as number
    }


    @tran
    static async assertIADocumentId(conn: any, documentCode: string, dossier_id: number): Promise<number> {
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
        return document_id as number
    }

    @tran
    static async updateDocumentContent(conn: any, document_id: number, content_source_id: number, content: string) {
        await conn.query('UPDATE ia_document SET content_source_id = ?, content = ? WHERE id = ?', [content_source_id, content, document_id])
    }

    @con
    static async retrieveDocument(conn: any, document_id: number): Promise<IADocument | undefined> {
        const [result] = await conn.query('SELECT * FROM ia_document WHERE id = ?', [document_id])
        if (!result || result.length === 0) return undefined
        const record: IADocument = result[0]
        return record
    }

    @tran
    static async assertIABatchDossierId(conn: any, batch_id: number, dossier_id: number): Promise<number> {
        // Check or insert document
        let batch_dossier_id: number | null = null
        let [documents] = await conn.query('SELECT id FROM ia_batch_dossier WHERE batch_id = ? AND dossier_id = ?', [batch_id, dossier_id])
        if (documents.length > 0) {
            batch_dossier_id = documents[0].id
        } else {
            const [documentResult] = await conn.query('INSERT INTO ia_batch_dossier (batch_id, dossier_id) VALUES (?, ?)', [batch_id, dossier_id])
            batch_dossier_id = documentResult.insertId
        }
        return batch_dossier_id as number
    }

    @tran
    static async deleteIABatchDossierId(conn: any, batch_id: number, dossier_id: number): Promise<undefined> {
        let [documents] = await conn.query('DELETE FROM ia_batch_dossier WHERE batch_id = ? AND dossier_id = ?', [batch_id, dossier_id])
    }

    @tran
    static async insertIABatchDossierItem(conn: any, data: IABatchDossierItem): Promise<IAGenerated> {
        const { batch_dossier_id, document_id, generation_id, descr, seq } = data

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
    }

    @tran
    static async assertIAEnumId(conn: any, descr: string): Promise<number> {
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
        return id as number
    }

    @tran
    static async assertIAEnumItemId(conn: any, descr: string, enum_id: number): Promise<number> {
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
        return id as number
    }

    @tran
    static async assertIABatchDossierEnumItemId(conn: any, batch_dossier_id: number, enum_item_id: number): Promise<number> {
        // Check or insert document
        let id: number | null = null
        let [batches] = await conn.query('SELECT id FROM ia_batch_dossier_enum_item WHERE batch_dossier_id = ? AND enum_item_id = ?', [batch_dossier_id, enum_item_id])
        if (batches.length > 0) {
            id = batches[0].id
        } else {
            const [batchResult] = await conn.query('INSERT INTO ia_batch_dossier_enum_item (batch_dossier_id, enum_item_id) VALUES (?,?)', [batch_dossier_id, enum_item_id])
            id = batchResult.insertId
        }
        return id as number
    }

    @con
    static async retrieveEnumItems(conn: any): Promise<IAEnumItem[]> {
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
    }

    @tran
    static async assertIAUserId(conn: any, username: string): Promise<number> {
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
        return user_id as number
    }

}