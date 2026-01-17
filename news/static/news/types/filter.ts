import { Entity } from 'static/js/common/types/entity'

export interface Filter extends Entity {
    id?: number
    entry?: string
    part?: string  // "full" | "start" | "end" | "part"
    feed_id?: number
}