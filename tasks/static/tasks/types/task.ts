export interface Annotation {
    entry?: Date
    description: string
}

export interface Task {
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
    depends?: Set<Task>
    blocks?: Set<Task>
    status?: string
    annotations?: Array<Annotation>
}