import { updateWithLatestAndOfficial } from '@/lib/db/mysql-types'
import Ranking from './ranking'
import { Dao } from '@/lib/db/mysql'


export default async function RankingContents(props: { kind: string }) {
    const { kind } = props
    const models = await Dao.retrieveModels(null)
    const prompts = await Dao.retrievePromptsIdsAndNamesByKind(null, kind)
    const testsets = await Dao.retrieveOfficialTestsetsIdsAndNamesByKind(null, kind)

    const promptsWithLatestAndOfficial = updateWithLatestAndOfficial(prompts)

    return (
        <Ranking kind={kind} prompts={promptsWithLatestAndOfficial} models={models} testsets={testsets} />
    )
}