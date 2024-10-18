import Ranking from './ranking'
import { Dao } from '@/lib/mysql'


export default async function RankingContents(props: { kind: string }) {
    const { kind } = props
    const models = await Dao.retrieveModels(null)
    const prompts = await Dao.retrievePromptsIdsAndNamesByKind(null, kind)
    const testsets = await Dao.retrieveOfficialTestsetsIdsAndNamesByKind(null, kind)

    const promptsWithLatestAndOfficial = prompts.map(prompt => ({ id: prompt.id, name: prompt.name + (prompt.is_last ? ' (último)' : prompt.is_last ? ' (último)' : '') }))

    return (
        <Ranking kind={kind} prompts={promptsWithLatestAndOfficial} models={models} testsets={testsets} />
    )
}