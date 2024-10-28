'use server'

import { Dao } from "../db/mysql";
import { SelectableItem, SelectableItemWithLatestAndOfficial } from "../db/mysql-types";

export async function loadPrompts(kind: string): Promise<SelectableItemWithLatestAndOfficial[]> {
    return Dao.retrievePromptsIdsAndNamesByKind(null, kind)
}

export async function loadModels(kind: string): Promise<SelectableItem[]> {
    return await Dao.retrieveModels(null)
}