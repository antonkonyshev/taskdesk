import { Entity } from 'static/js/common/types/entity'

export interface Feed extends Entity {
    id?: number
    url?: string
    title?: string
}