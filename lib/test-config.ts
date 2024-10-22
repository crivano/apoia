import { IAModel, IAPrompt, IATest, IATestset, IATestTest, IATestTestAttemptAnswer } from "@/lib/mysql-types"

export const ATTEMPTS = 5

export function scorePerQuestion(arg0: IATestTest, idxQuestion: number): number {
    let total = 0
    let acertos = 0
    arg0.attempts.forEach(attempt => {
        if (idxQuestion < attempt.answers.length) {
            total++
            if (attempt.answers[idxQuestion].result) {
                acertos++
            }
        }
    })
    return total ? ((acertos / total) * 100) : 0
}

export function scorePerAttempt(tests: IATestTest[], idx: number): number {
    let totalQuestions = 0;
    let totalCorrect = 0;

    tests.forEach(test => {
        test.questions.forEach((_, idxQuestion) => {
            if (idx < test.attempts.length && idxQuestion < test.attempts[idx].answers.length) {
                totalQuestions++;
                if (test.attempts[idx].answers[idxQuestion].result) {
                    totalCorrect++;
                }
            }
        });
    });

    return totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100) : 0
}

export function score(tests: IATestTest[]): number {
    let totalQuestions = 0;
    let totalCorrect = 0;

    tests.forEach(test => {
        test.questions.forEach((_, idxQuestion) => {
            test.attempts.forEach(attempt => {
                if (idxQuestion < attempt.answers.length) {
                    totalQuestions++;
                    if (attempt.answers[idxQuestion].result) {
                        totalCorrect++;
                    }
                }
            });
        });
    });

    return totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100) : 0;
}

export function preprocessQuestion(question: string): string {
    if (question.startsWith('"') && question.endsWith('"'))
        return `Existe, no texto a ser analisado, um trecho com o mesmo sentido de ${question}?`
    return question
}

export function buildTest(testset: IATestset, prompt: IAPrompt, model: IAModel, promptResults: string[], questionsResults: any[]): IATest {
    const jsonTest: IATest = {
        id: 0,
        testset_id: testset.id,
        prompt_id: prompt.id,
        model_id: model.id,
        score: 0,
        content: {
            tests: testset.content.tests.map(test => ({
                name: test.name,
                questions: test.questions.map(q => ({ question: preprocessQuestion(q.question) })),
                attempts: []
            }))
        }
    }

    for (let i = 0; i < promptResults.length; i++) {
        const promptResult = promptResults[i]
        const test = i % testset.content.tests.length
        const attempt = Math.floor(i / testset.content.tests.length)
        let answers: IATestTestAttemptAnswer[] = []
        if (questionsResults.length > i && questionsResults[i].respostas) {
            answers = questionsResults[i].respostas.map((r) => ({
                snippet: r.trecho,
                result: r.resposta === 'sim' ? true : r.resposta === 'não' ? false : undefined,
                justification: r.justificativa
            }))
        }
        jsonTest.content.tests[test].attempts.push({ result: promptResult, answers })
    }

    jsonTest.score = score(jsonTest.content.tests)

    return jsonTest
}

