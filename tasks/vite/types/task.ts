import { Entity } from 'TaskDesk/js/common/types/entity'


export interface Annotation extends Entity {
    entry?: Date
    description: string
}

export interface Task extends Entity {
    id?: number
    uuid?: string
    description?: string
    urgency?: number
    project?: string
    tags?: Array<string>
    entry?: Date
    modifier?: Date
    due?: Date
    wait?: Date
    depends?: Array<string>
    depending?: boolean
    blocking?: boolean
    status?: string
    annotations?: Array<Annotation>
}