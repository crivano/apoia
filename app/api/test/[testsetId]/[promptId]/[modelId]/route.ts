import { streamContent } from '@/lib/generate'
import { NextResponse } from 'next/server'
import Fetcher from '@/lib/fetcher'
import { CoreTool, DeepPartial, StreamingTextResponse, StreamObjectResult, StreamTextResult } from 'ai'
import { removeEmptyKeys } from '@/lib/build-messages'
import { PromptOptions } from '@/lib/prompt-types'
import { ProgressType } from '@/lib/progress'
import { Dao } from '@/lib/mysql'
import { slugify } from '@/lib/utils'
import { ATTEMPTS, buildTest, preprocessQuestion } from '../../../../../../lib/test-config'
import { IATest } from '@/lib/mysql-types'

export const maxDuration = 60


export async function GET(req: Request, { params }: { params: { testsetId: number, promptId: number, modelId: number } }) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream<any>({
    async start(controller) {
      controller.enqueue('{');
      await execute(params.testsetId, params.promptId, params.modelId, controller)
      controller.enqueue('}');
      controller.close()
    }
  })
  const res = new NextResponse(stream);
  res.headers.set('Content-Type', 'application/json; charset=utf-8'); //'text/html; charset=utf-8');
  return res;
}

const execute = async (testsetId: number, promptId: number, modelId: number, controller) => {
  let test = await Dao.retrieveTestByTestsetIdPromptIdAndModelId(null, testsetId, promptId, modelId)
  if (test) throw new Error('Test already exists')

  controller.enqueue(`"testsetId": "${testsetId}",`)
  controller.enqueue(`"promptId": "${promptId}",`)
  controller.enqueue(`"modelId": "${modelId}"`)

  const testset = await Dao.retrieveTestsetById(null, testsetId)
  if (!testset) throw new Error('Testset not found')
  const testsetModel = await Dao.retrieveModelById(null, testset.model_id)
  if (!testsetModel) throw new Error('Testset model not found')
  const prompt = await Dao.retrievePromptById(null, promptId)
  const model = await Dao.retrieveModelById(null, modelId)

  if (!testset || !prompt || !model)
    throw new Error('Testset, Prompt or Model not found')

  if (prompt.content.format)
    controller.enqueue(`,"promptFormat": "${encodeJsonString(prompt.content.format)}"`)

  let testCount = testset.content.tests.length
  let stepMax = testCount * 2 * ATTEMPTS + 1
  let stepCount = 0
  const yieldProgress = (s: string, percent: number) => { controller.enqueue(`,\n"progress-${stepCount++}": ${JSON.stringify({ s, percent })}`) }

  const progress: ProgressType = {
    set: (s: string, percent: number) => {
      console.log(`Progress: ${s} (${percent}%)`)
      yieldProgress(s, percent)
    },
    remove: () => {
      console.log(`Progress: removed`)
    }
  }

  const promptResults: string[] = []
  const questionsResults: any[] = []

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    yieldProgress(`Ciclo ${attempt + 1}`, 0)
    for (let i = 0; i < testset.content.tests.length; i++) {
      const test = testset.content.tests[i]
      yieldProgress(`Teste ${i} - ${test.name} - Executando Prompt`, 0)
      const data: any = { textos: test.texts.map(t => ({ descr: t.name, slug: slugify(t.name), texto: t.value })) }
      const date = new Date()
      const options: PromptOptions = {
        overrideSystemPrompt: prompt.content.system_prompt || '',
        overridePrompt: prompt.content.prompt || '',
        overrideJsonSchema: prompt.content.json_schema || '',
        overrideFormat: prompt.content.format || '',
        overrideModel: model.name,
        cacheControl: attempt + 1
      }
      removeEmptyKeys(options)
      const resultStream = await streamContent(prompt.kind, data, date, options)
      const result = await streamString(`prompt-result-${attempt * stepMax + i * 2}`, resultStream, controller)
      console.log(`Result: ${result}`)
      promptResults.push(result)

      yieldProgress(`Teste ${i} - ${test.name} - Testando o Resultado`, 0)
      const data2: any = {
        textos: [
          { descr: 'TEXTO', slug: 'texto', texto: result },
          { descr: 'PERGUNTAS:', slug: 'perguntas', texto: JSON.stringify(test.questions.map(q => ({ question: preprocessQuestion(q.question) }))) }]
      }
      const date2 = new Date()
      const options2: PromptOptions = {
        overrideModel: testsetModel.name,
        cacheControl: attempt + 1
      }
      removeEmptyKeys(options2)
      const resultStream2 = await streamContent('int-testar', data2, date2, options2)
      const result2 = await streamString(`questions-result-${attempt * stepMax + i * 2 + 1}`, resultStream2, controller)
      console.log(`Result2: ${result2}`)
      questionsResults.push(JSON.parse(result2))
    }
  }

  yieldProgress(`Gravando resultados`, 0)
  const testToInsert = buildTest(testset, prompt, model, promptResults, questionsResults)
  Dao.insertIATest(null, testToInsert)
  yieldProgress('', 0)
}

function encodeJsonString(s: string): string {
  return JSON.stringify(s).slice(1, -1)
}

async function streamString(key: string, stream: StreamTextResult<Record<string, CoreTool<any, any>>> | StreamObjectResult<DeepPartial<any>, any, never> | string, controller) {
  controller.enqueue(`,\n"${key}": "`)
  let text: string
  if (typeof stream === 'string') {
    controller.enqueue(encodeJsonString(stream))
    text = stream
  } else {
    text = ''
    for await (const textPart of stream.textStream) {
      process.stdout.write(textPart)
      controller.enqueue(encodeJsonString(textPart))
      text += textPart
    }
    // text = await (stream as StreamTextResult<Record<string, CoreTool<any, any>>>).text
  }
  controller.enqueue(`"`)
  return text
}

