import { Ref } from 'vue'
import { Entity } from './types/entity'
import { updateItem } from './service'

export const refreshItem = (
    item: Entity, collection: Ref<Array<Entity>>,
    comparison: (elem: Entity) => boolean,
    reverseSorting: boolean = false
) => {
    if (!item) {
        return
    }
    const idx = collection.value.findIndex(comparison)
    if (idx >= 0) {
        collection.value.splice(idx, 1, item)
    } else {
        if (reverseSorting) {
            collection.value.push(item) 
        } else {
            collection.value.unshift(item)
        }
    }
}

export const removeItem = async (
    item: Entity, collection: Ref<Array<Entity>>,
    endpoint: string, comparison: (elem: Entity) => boolean,
) => {
    const idx = collection.value.findIndex(comparison)
    if (idx >= 0) {
        collection.value.splice(idx, 1)
    }
    if (item.id) {
        try {
            await updateItem(item, 'delete', endpoint)
        } catch(err) {
            collection.value.splice(idx, 0, item)
        }
    }
}

export const saveItem = async (
    item: Entity, collection: Ref<Array<Entity>>,
    endpoint: string, comparison: (elem: Entity) => boolean,
) => {
    if (!item.id) {
        collection.value.unshift(item)
    }
    try {
        refreshItem(await updateItem(
            item, 'post', endpoint), collection, comparison)
    } catch(err) {
        if (!item.id) {
            collection.value.splice(0, 1)
        }
    }
}