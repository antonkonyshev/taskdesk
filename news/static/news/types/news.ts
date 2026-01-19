export interface News {
    id: number
    guid: string
    title: string
    description?: string
    link: string
    published: Date
    author?: string
    enclosure_url?: string
    enclosure_type?: string
    feed?: number
}