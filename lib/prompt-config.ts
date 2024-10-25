'use server'

import { Dao } from "./mysql";
import { SelectableItem, SelectableItemWithLatestAndOfficial } from "./mysql-types";

export async function loadPrompts(kind: string): Promise<SelectableItemWithLatestAndOfficial[]> {
    return Dao.retrievePromptsIdsAndNamesByKind(null, kind)
}

export async function loadModels(kind: string): Promise<SelectableItem[]> {
    return await Dao.retrieveModels(null)
}