import { getCurrentUser } from "../user"
import { slugify } from "../utils/utils"
import type * as mysqlTypes from "./mysql-types"

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
    @tran
    static async insertIATestset(conn: any, data: mysqlTypes.IATestsetToInsert): Promise<mysqlTypes.IATestset | undefined> {
        const { base_testset_id, kind, name, model_id, content } = data
        const slug = slugify(name)
        const created_by = (await getCurrentUser())?.id || null
        await conn.query(`
          INSERT INTO ia_testset (base_id, kind, name, slug, model_id, content, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [base_testset_id, kind, name, slug, model_id, JSON.stringify(content), created_by])
        conn.commit()
        const [insertResult] = await conn.query('SELECT * FROM ia_testset WHERE id = LAST_INSERT_ID()')
        const insertedRecord: mysqlTypes.IATestset = insertResult[0]
        return insertedRecord
    }

    @tran
    static async setOfficialTestset(conn: any, id: number): Promise<boolean> {
        const testset = await Dao.retrieveTestsetById(conn, id)
        if (!testset) throw new Error('Testset not found')
        const queryRemoveOthers = `
          UPDATE ia_testset SET is_official = 0 WHERE kind = ? AND slug = ? AND id != ?
        `
        await conn.query(queryRemoveOthers, [testset.kind, testset.slug, id])
        const query = `
          UPDATE ia_testset SET is_official = 1 WHERE id = ?
        `
        await conn.query(query, [id])
        return true
    }

    @tran
    static async removeOfficialTestset(conn: any, id: number): Promise<boolean> {
        const query = `
          UPDATE ia_testset SET is_official = 0 WHERE id = ?
        `
        await conn.query(query, [id])
        return true
    }

    @con
    static async retrieveTestsetById(conn: any, id: number): Promise<mysqlTypes.IATestset | undefined> {
        const [result] = await conn.query('SELECT * FROM ia_testset WHERE id = ?', [id])
        if (!result || result.length === 0) return undefined
        const record: mysqlTypes.IATestset = { ...result[0] }
        return record
    }


    @tran
    static async insertIAPrompt(conn: any, data: mysqlTypes.IAPromptToInsert): Promise<mysqlTypes.IAPrompt | undefined> {
        const { base_prompt_id, kind, name, model_id, testset_id, content } = data
        const slug = slugify(name)
        const created_by = (await getCurrentUser())?.id || null
        await conn.query(`
          INSERT INTO ia_prompt (base_id, kind, name, slug, model_id, testset_id, content, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [base_prompt_id, kind, name, slug, model_id, testset_id, JSON.stringify(content), created_by])
        conn.commit()
        const [insertResult] = await conn.query('SELECT * FROM ia_prompt WHERE id = LAST_INSERT_ID()')
        const insertedRecord: mysqlTypes.IAPrompt = insertResult[0]
        return insertedRecord
    }

    @tran
    static async setOfficialPrompt(conn: any, id: number): Promise<boolean> {
        const prompt = await Dao.retrievePromptById(conn, id)
        if (!prompt) throw new Error('Prompt not found')
        const queryRemoveOthers = `
          UPDATE ia_prompt SET is_official = 0 WHERE kind = ? AND slug = ? AND id != ?
        `
        await conn.query(queryRemoveOthers, [prompt.kind, prompt.slug, id])
        const query = `
          UPDATE ia_prompt SET is_official = 1 WHERE id = ?
        `
        await conn.query(query, [id])
        return true
    }

    @tran
    static async removeOfficialPrompt(conn: any, id: number): Promise<boolean> {
        const query = `
          UPDATE ia_prompt SET is_official = 0 WHERE id = ?
        `
        await conn.query(query, [id])
        return true
    }


    @con
    static async retrievePromptById(conn: any, id: number): Promise<mysqlTypes.IAPrompt | undefined> {
        const [result] = await conn.query('SELECT * FROM ia_prompt WHERE id = ?', [id])
        if (!result || result.length === 0) return undefined
        const record: mysqlTypes.IAPrompt = { ...result[0] }
        return record
    }

    @con
    static async retrieveCountersByPromptKinds(conn: any): Promise<{ kind: string, prompts: number, testsets: number }[]> {
        const [result] = await conn.query(`
            SELECT any_value(k.kind) kind, count(distinct(p.slug)) prompts, count(distinct(t.slug)) testsets
            FROM (select kind from (select distinct(kind) kind from ia_prompt union select distinct(kind) kind from ia_testset) u group by kind) k
            left join ia_prompt p on p.kind = k.kind
            left join ia_testset t on t.kind = k.kind
            group by k.kind
        `)
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrievePromptsByKind(conn: any, kind: string): Promise<{ slug: string, name: string, versions: number, created_at: Date, modified_at: Date, official_at: Date, created_id: number, modified_id: number, official_id: number }[]> {
        const [result] = await conn.query(`
            WITH t1 AS
            (SELECT slug, min(created_at) created_at, min(created_id) created_id, min(modified_at) modified_at, min(modified_id) modified_id, min(name) name, count(*) versions
            FROM (
                SELECT 
                slug, 
                FIRST_VALUE(created_at) OVER first AS created_at,
                FIRST_VALUE(id) OVER first AS created_id,
                FIRST_VALUE(created_at) OVER last AS modified_at,
                FIRST_VALUE(id) OVER last AS modified_id,
                FIRST_VALUE(name) OVER last AS name
                FROM ia_prompt
                WHERE kind = ?
                WINDOW first as (PARTITION BY slug ORDER BY created_at), last as (PARTITION BY slug ORDER BY created_at desc)
            ) p
            GROUP BY slug
            ORDER BY slug),
            t2 AS
            (SELECT t1.*, o.id official_id, o.created_at official_at
            FROM t1 LEFT JOIN ia_prompt o ON t1.slug = o.slug AND o.is_official = 1)
            SELECT t2.* from t2;
        `, [kind])
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrieveTestsetsByKind(conn: any, kind: string): Promise<{ slug: string, name: string, versions: number, created: Date, modified: Date }[]> {
        const [result] = await conn.query(`
            WITH t1 AS
            (SELECT slug, min(created_at) created_at, min(created_id) created_id, min(modified_at) modified_at, min(modified_id) modified_id, min(name) name, count(*) versions
            FROM (
                SELECT 
                slug, 
                FIRST_VALUE(created_at) OVER first AS created_at,
                FIRST_VALUE(id) OVER first AS created_id,
                FIRST_VALUE(created_at) OVER last AS modified_at,
                FIRST_VALUE(id) OVER last AS modified_id,
                FIRST_VALUE(name) OVER last AS name
                FROM ia_testset
                WHERE kind = ?
                WINDOW first as (PARTITION BY slug ORDER BY created_at), last as (PARTITION BY slug ORDER BY created_at desc)
            ) p
            GROUP BY slug
            ORDER BY slug),
            t2 AS
            (SELECT t1.*, o.id official_id, o.created_at official_at
            FROM t1 LEFT JOIN ia_testset o ON t1.slug = o.slug AND o.is_official = 1)
            SELECT t2.* from t2;
        `, [kind])
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrievePromptsIdsAndNamesByKind(conn: any, kind: string): Promise<mysqlTypes.SelectableItemWithLatestAndOfficial[]> {
        const [result] = await conn.query(`
            SELECT t.id, t.name, t.slug, t.created_at, t.is_official
            FROM ia_prompt t
            WHERE t.kind = ?
            ORDER BY t.slug, t.created_at DESC
        `, [kind])
        if (!result || result.length === 0) return []
        result.forEach((record: any, index: number) => {
            record.is_last = index === 0 || record.slug !== result[index - 1].slug
        })
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrieveOfficialPromptsIdsAndNamesByKind(conn: any, kind: string): Promise<{ id: string, name: string }[]> {
        const [result] = await conn.query(`
            SELECT t.id, t.name
            FROM ia_prompt t
            WHERE t.kind = ? AND is_official = 1
        `, [kind])
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrieveOfficialTestsetsIdsAndNamesByKind(conn: any, kind: string): Promise<{ id: string, name: string }[]> {
        const [result] = await conn.query(`
            SELECT t.id, t.name
            FROM ia_testset t
            WHERE t.kind = ? AND is_official = 1
        `, [kind])
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrieveModels(conn: any): Promise<{ id: string, name: string }[]> {
        const [result] = await conn.query(`
            SELECT t.id, t.name
            FROM ia_model t
        `)
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrieveModelById(conn: any, id: number): Promise<mysqlTypes.IAModel | undefined> {
        const [result] = await conn.query('SELECT * FROM ia_model WHERE id = ?', [id])
        if (!result || result.length === 0) return undefined
        const record: mysqlTypes.IAModel = result[0]
        return record
    }


    @con
    static async retrievePromptsByKindAndSlug(conn: any, kind: string, slug: string): Promise<{ id: number, testset_id: number, model_id: number, kind: string, name: string, slug: string, content: any, created_by: number, created_at: Date, is_official: boolean, testset_slug: string, testset_name: string, model_name: string, user_username: string, score: number }[]> {
        const [result] = await conn.query(`
            SELECT p.id, p.testset_id, p.model_id, p.kind, p.name, p.slug, p.content, p.created_by, p.created_at, p.is_official, t.slug testset_slug, t.name testset_name, m.name model_name, u.username user_username, s.score score
            FROM ia_prompt p
            LEFT JOIN ia_testset t on p.testset_id = t.id
            LEFT JOIN ia_model m on p.model_id = m.id
            LEFT JOIN ia_user u on p.created_by = u.id
            LEFT JOIN ia_test s on p.testset_id = s.testset_id AND p.model_id = s.model_id AND p.id = s.prompt_id
            WHERE p.kind = ? AND p.slug = ?
            ORDER BY p.created_at DESC
        `, [kind, slug])
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrieveTestsetsByKindAndSlug(conn: any, kind: string, slug: string): Promise<{ id: number, testset_id: number, model_id: number, kind: string, name: string, slug: string, content: any, created_by: number, created_at: Date, is_official: boolean, testset_slug: string, testset_name: string, model_name: string, user_username: string, score: number }[]> {
        const [result] = await conn.query(`
            SELECT p.id, p.model_id, p.kind, p.name, p.slug, p.content, p.created_by, p.created_at, p.is_official, m.name model_name, u.username user_username
            FROM ia_testset p
            LEFT JOIN ia_model m on p.model_id = m.id
            LEFT JOIN ia_user u on p.created_by = u.id
            WHERE p.kind = ? AND p.slug = ?
            ORDER BY p.created_at DESC
        `, [kind, slug])
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @con
    static async retrieveRanking(conn: any, kind: string, testset_id?: number, prompt_id?: number, model_id?: number): Promise<mysqlTypes.IARankingType[]> {
        const [result] = await conn.query(`
            SELECT s.testset_id, t.name testset_name, t.slug testset_slug, s.prompt_id, p.name prompt_name, p.slug prompt_slug, s.model_id, m.name model_name, s.score
            FROM ia_test s
            INNER JOIN ia_model m ON s.model_id = m.id
            INNER JOIN ia_prompt p ON s.prompt_id = p.id
            INNER JOIN ia_testset t ON s.testset_id = t.id AND t.kind = ?
            WHERE (s.testset_id = ? OR ? IS NULL) AND (s.prompt_id = ? OR ? IS NULL) AND (s.model_id = ? OR ? IS NULL)
            ORDER BY s.score DESC
        `, [kind, testset_id || null, testset_id || null, prompt_id || null, prompt_id || null, model_id || null, model_id || null])
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    @tran
    static insertIATest(conn: any, test: mysqlTypes.IATest) {
        return conn.query(`
            INSERT INTO ia_test (testset_id, prompt_id, model_id, score, content)
            VALUES (?, ?, ?, ?, ?)
        `, [test.testset_id, test.prompt_id, test.model_id, test.score, JSON.stringify(test.content)])
    }

    @con
    static async retrieveTestByTestsetIdPromptIdAndModelId(conn: any, testset_id: number, prompt_id: number, model_id: number): Promise<mysqlTypes.IATest | undefined> {
        const [result] = await conn.query(`
            SELECT * FROM ia_test 
            WHERE testset_id = ? AND prompt_id = ? AND model_id = ?
        `, [testset_id, prompt_id, model_id])
        if (!result || result.length === 0) return undefined
        const record: mysqlTypes.IATest = { ...result[0] }
        return record
    }

    @con
    static async retrieveIAGeneration(conn: any, data: mysqlTypes.IAGeneration): Promise<mysqlTypes.IAGenerated | undefined> {
        const { model, prompt, sha256, attempt } = data
        const sql = `
            SELECT * FROM ia_generation WHERE evaluation_id IS NULL
                AND model = ? 
                AND prompt = ? 
                AND sha256 = ?
                AND attempt ${attempt === null ? 'IS NULL' : '= ?'}`
        const [result] = await conn.query(sql, [model, prompt, sha256, attempt])
        if (!result || result.length === 0) return undefined
        const record: mysqlTypes.IAGenerated = result[0]
        return record
    }

    @con
    static async retrieveByBatchIdAndEnumId(conn: any, batch_id: number, enum_id: number): Promise<mysqlTypes.AIBatchIdAndEnumId[]> {
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
    static async retrieveCountByBatchIdAndEnumId(conn: any, batch_id: number, enum_id: number): Promise<mysqlTypes.AICountByBatchIdAndEnumId[]> {
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
    static async retrieveGenerationByBatchDossierId(conn: any, batch_dossier_id: number): Promise<mysqlTypes.AIBatchDossierGeneration[]> {
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
    static async insertIAGeneration(conn: any, data: mysqlTypes.IAGeneration): Promise<mysqlTypes.IAGenerated | undefined> {
        const { model, prompt, sha256, generation, attempt } = data

        // Insert into ia_generation
        const query = `
          INSERT INTO ia_generation (model, prompt, sha256, generation, attempt)
          VALUES (?, ?, ?, ?, ?)
          `
        await conn.query(query, [model, prompt, sha256, generation, attempt])
        conn.commit()
        const [insertResult] = await conn.query('SELECT * FROM ia_generation WHERE id = LAST_INSERT_ID()')
        const insertedRecord: mysqlTypes.IAGenerated = insertResult[0]
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
    static async assertIADocumentId(conn: any, dossier_id: number, documentCode: string, assigned_category: string | null): Promise<number> {
        // Check or insert document
        let document_id: number | null = null
        if (documentCode) {
            let [documents] = await conn.query('SELECT id FROM ia_document WHERE code = ?', [documentCode])
            if (documents.length > 0) {
                document_id = documents[0].id

                // Update assigned_category_id
                if (assigned_category && documents[0].assigned_category !== assigned_category) {
                    await conn.query('UPDATE ia_document SET assigned_category = ? WHERE id = ?', [assigned_category, document_id])
                }
            } else {
                const [documentResult] = await conn.query('INSERT INTO ia_document (code, dossier_id, assigned_category) VALUES (?, ?, ?)', [documentCode, dossier_id, assigned_category])
                document_id = documentResult.insertId
            }
        }
        return document_id as number
    }

    @tran
    static async updateDocumentContent(conn: any, document_id: number, content_source_id: number, content: string) {
        await conn.query('UPDATE ia_document SET content_source_id = ?, content = ? WHERE id = ?', [content_source_id, content, document_id])
    }

    @tran
    static async updateDocumentCategory(conn: any, document_id: number, assigned_category: string | null, predicted_category: string | null) {
        await conn.query('UPDATE ia_document SET assigned_category = ?, predicted_category = ? WHERE id = ?', [assigned_category, predicted_category, document_id])
    }

    @con
    static async retrieveDocument(conn: any, document_id: number): Promise<mysqlTypes.IADocument | undefined> {
        const [result] = await conn.query('SELECT * FROM ia_document WHERE id = ?', [document_id])
        if (!result || result.length === 0) return undefined
        const record: mysqlTypes.IADocument = result[0]
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
    static async insertIABatchDossierItem(conn: any, data: mysqlTypes.IABatchDossierItem): Promise<mysqlTypes.IAGenerated> {
        const { batch_dossier_id, document_id, generation_id, descr, seq } = data

        // Insert into ia_generation
        const query = `
          INSERT INTO ia_batch_dossier_item (batch_dossier_id, document_id, generation_id, descr, seq)
          VALUES (?, ?, ?, ?, ?)
          `
        await conn.query(query, [batch_dossier_id, document_id, generation_id, descr, seq])
        conn.commit()
        const [insertResult] = await conn.query('SELECT * FROM ia_batch_dossier_item WHERE id = LAST_INSERT_ID()')
        const insertedRecord: mysqlTypes.IAGenerated = insertResult[0]
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
    static async retrieveEnumItems(conn: any): Promise<mysqlTypes.IAEnumItem[]> {
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