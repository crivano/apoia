'use server'

import { Dao } from "./mysql";
import { SelectableItemWithLatestAndOfficial } from "./mysql-types";

export async function loadPrompts(kind: string, promptId?: number): Promise<SelectableItemWithLatestAndOfficial[]> {
    return Dao.retrievePromptsIdsAndNamesByKind(null, kind)
}

export async function loadModels(kind: string, promptId?: number): Promise<SelectableItemWithLatestAndOfficial[]> {
    return (await Dao.retrieveModels(null)).map(model => ({ id: model.id, name: model.name }))
}