import { getCurrentUser } from "../user"
import { slugify } from "../utils/utils"
import * as mysqlTypes from "./mysql-types"
import knex from './knex'

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
    static async insertIATestset(data: mysqlTypes.IATestsetToInsert): Promise<mysqlTypes.IATestset | undefined> {
        const { base_testset_id, kind, name, model_id, content } = data
        const slug = slugify(name)
        const created_by = (await getCurrentUser())?.id || null
        const [id] = await knex('ia_testset').insert({
            base_id: base_testset_id, kind, name, slug, model_id, content, created_by
        })
        const inserted = await knex.select().from<mysqlTypes.IATestset>('ia_testset').where({ id }).first()
        return inserted
    }

    static async setOfficialTestset(id: number): Promise<boolean> {
        const trx = await knex.transaction()
        try {
            const testset = await Dao.retrieveTestsetById(id)
            if (!testset) throw new Error('Testset not found')
            const { kind, slug } = testset
            const queryRemoveOthers = trx('ia_testset').update({
                is_official: 0
            }).where({
                kind,
                slug,
                id
            })
            await Promise.all([queryRemoveOthers, Dao.removeOfficialTestset(id)])
            await trx.commit()
            return true
        } catch (error) {
            await trx.rollback()
            console.error(`Dao error ${error?.message}`)
            return false
        }
    }

    static async removeOfficialTestset(id: number): Promise<boolean> {
        await knex('ia_testset').update({ is_official: 1 }).where({ id })
        return true
    }

    static async retrieveTestsetById(id: number): Promise<mysqlTypes.IATestset | undefined> {
        const result = await knex.select().from<mysqlTypes.IATestset>('ia_testset').where({ id }).first()
        return result
    }


    @tran
    static async insertIAPrompt(conn: any, data: mysqlTypes.IAPromptToInsert): Promise<mysqlTypes.IAPrompt | undefined> {
        const { base_prompt_id, kind, name, model_id, testset_id, content } = data
        const slug = slugify(name)
        const created_by = (await getCurrentUser())?.id || null
        const result = await knex('ia_prompt').insert<mysqlTypes.IAPrompt>({
            base_id: base_prompt_id,
            kind, name, slug, model_id, testset_id, content: JSON.stringify(content), created_by
        }).returning('id')
        const record = await knex('ia_prompt').select<mysqlTypes.IAPrompt>('*').where({ id: result }).first()
        return record
    }

    static async setOfficialPrompt(id: number): Promise<boolean> {
        const trx = await knex.transaction()

        const prompt = await Dao.retrievePromptById(id)
        if (!prompt) throw new Error('Prompt not found')
        try {
            await trx('ia_prompt').update<mysqlTypes.IAPrompt>({
                is_official: 0,
            }).where({ kind: prompt.kind, slug: prompt.slug, id })
            await trx('ia_prompt').update<mysqlTypes.IAPrompt>({
                is_official: 1
            }).where({ id })
            await trx.commit()
            return true
        } catch (error) {
            trx.rollback()
            console.error(error?.message)
            return false
        }
    }

    static async removeOfficialPrompt(id: number): Promise<boolean> {
        const updates = await knex('ia_prompt').update({
            is_official: 0
        }).where({ id }).returning("*")
        return updates.length > 0
    }


    static async retrievePromptById(id: number): Promise<mysqlTypes.IAPrompt | undefined> {
        const result = await knex.select().from<mysqlTypes.IAPrompt>('ia_prompt').where({ id }).first()
        return result
    }

    static async retrieveCountersByPromptKinds(): Promise<{ kind: string, prompts: number, testsets: number }[]> {
        const result = await knex('ia_prompt as p')
            .select(
                'k.kind',  // Select 'kind' from the union of both tables
                knex.raw('COUNT(DISTINCT p.slug) as prompts'),  // Count distinct slugs in ia_prompt
                knex.raw('COUNT(DISTINCT t.slug) as testsets')  // Count distinct slugs in ia_testset
            )
            .leftJoin(
                knex
                    .select('kind')
                    .from('ia_prompt')
                    .union(function () {
                        this.select('kind').from('ia_testset');
                    })
                    .as('k'), 'p.kind', '=', 'k.kind'
            )
            .leftJoin('ia_testset as t', 't.kind', '=', 'p.kind')
            .groupBy('k.kind');  // Group by 'kind' from the union

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

    static async retrievePromptsIdsAndNamesByKind(kind: string): Promise<mysqlTypes.SelectableItemWithLatestAndOfficial[]> {
        const result = await knex('ia_prompt')
            .select('id', 'name', 'slug', 'created_at', 'is_official')
            .where('kind', kind)
            .orderBy('slug')
            .orderBy('created_at', 'desc')
        if (!result || result.length === 0) return []
        result.forEach((record: any, index: number) => {
            record.is_last = index === 0 || record.slug !== result[index - 1].slug
        })
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    static async retrieveOfficialPromptsIdsAndNamesByKind(kind: string): Promise<{ id: string, name: string }[]> {
        const result = await knex('ia_prompt').select<Array<mysqlTypes.IAPrompt>>('id', 'name').where({
            kind, is_official: 1
        })
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    static async retrieveOfficialTestsetsIdsAndNamesByKind(kind: string): Promise<{ id: string, name: string }[]> {
        const result = await knex('ia_testset').select<Array<mysqlTypes.IATestset>>('id', 'name').where({
            kind, is_official: 1
        })
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    static async retrieveModels(): Promise<{ id: string, name: string }[]> {
        const result = await knex('ia_model').select<Array<mysqlTypes.IAModel>>('id', 'name')
        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    static async retrieveModelById(id: number): Promise<mysqlTypes.IAModel | undefined> {
        const result = await knex('ia_model').select<Array<mysqlTypes.IAModel>>('*').where({ id }).first()
        return result
    }

    static async retrievePromptsByKindAndSlug(kind: string, slug: string): Promise<mysqlTypes.PromptByKind[]> {
        const result = await knex('ia_prompt as p')
            .select<Array<mysqlTypes.PromptByKind>>(
                'p.id',
                'p.testset_id',
                'p.model_id',
                'p.kind',
                'p.name',
                'p.slug',
                'p.content',
                'p.created_by',
                'p.created_at',
                'p.is_official',
                't.slug as testset_slug',
                't.name as testset_name',
                'm.name as model_name',
                'u.username as user_username',
                's.score as score'
            )
            .leftJoin('ia_testset as t', 'p.testset_id', 't.id')
            .leftJoin('ia_model as m', 'p.model_id', 'm.id')
            .leftJoin('ia_user as u', 'p.created_by', 'u.id')
            .leftJoin('ia_test as s', function () {
                this.on('p.testset_id', '=', 's.testset_id')
                    .andOn('p.model_id', '=', 's.model_id')
                    .andOn('p.id', '=', 's.prompt_id');
            })
            .where('p.kind', kind)
            .andWhere('p.slug', slug)
            .orderBy('p.created_at', 'desc');

        if (!result || result.length === 0) return []
        const records = result.map((record: any) => ({ ...record }))
        return records
    }

    static async retrieveTestsetsByKindAndSlug(kind: string, slug: string): Promise<{ id: number, testset_id: number, model_id: number, kind: string, name: string, slug: string, content: any, created_by: number, created_at: Date, is_official: boolean, testset_slug: string, testset_name: string, model_name: string, user_username: string, score: number }[]> {
        const result = await knex('ia_testset as p')
            .select(
                'p.id',
                'p.model_id',
                'p.kind',
                'p.name',
                'p.slug',
                'p.content',
                'p.created_by',
                'p.created_at',
                'p.is_official',
                'm.name as model_name',
                'u.username as user_username'
            )
            .leftJoin('ia_model as m', 'p.model_id', 'm.id')
            .leftJoin('ia_user as u', 'p.created_by', 'u.id')
            .where('p.kind', kind)
            .andWhere('p.slug', slug)
            .orderBy('p.created_at', 'desc');
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

    static async insertIATest(test: mysqlTypes.IATest) {
        await knex('ia_test').insert({
            testset_id: test.testset_id,
            prompt_id: test.prompt_id,
            model_id: test.model_id,
            score: test.score,
            content: JSON.stringify(test.content)
        })
    }

    static async retrieveTestByTestsetIdPromptIdAndModelId(testset_id: number, prompt_id: number, model_id: number): Promise<mysqlTypes.IATest | undefined> {
        const result = await knex('ia_test').select<mysqlTypes.IATest>('*').where({
            testset_id, prompt_id, model_id
        }).first()
        return result
    }

    static async retrieveIAGeneration(data: mysqlTypes.IAGeneration): Promise<mysqlTypes.IAGenerated | undefined> {
        const { model, prompt, sha256, attempt } = data
        const sql = knex('ia_generation').select<mysqlTypes.IAGenerated>('*').whereNull('evaluation_id').where({
            model,
            prompt,
            sha256,
        })
        if (attempt) {
            sql.where(attempt)
        } else {
            sql.whereNull('attempt')
        }
        const result = await sql.first()
        return result
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

    static async assertSystemId(code?: string): Promise<number> {
        if (!code) {
            return 0
        }
        const item = await knex('ia_system').select<mysqlTypes.IASystem>('id').where('code', code).first()
        if (item) {
            return item.id
        } else {
            const result = await knex('ia_system').returning('id').insert({ code })
            return result[0]
        }
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
        // console.log('updateDocumentCategory', document_id, assigned_category, predicted_category)
        await conn.query('UPDATE ia_document SET assigned_category = ?, predicted_category = ? WHERE id = ?', [assigned_category, predicted_category, document_id])
    }

    @con
    static async verifyIfDossierHasDocumentsWithPredictedCategories(conn: any, dossierCode: string): Promise<boolean> {
        const [result] = await conn.query(`
            SELECT COUNT(*) as count FROM ia_dossier p JOIN ia_document d ON p.id = d.dossier_id
            WHERE p.code = ? AND predicted_category IS NOT NULL
        `, [dossierCode])
        return result[0].count > 0
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

