import { Filter } from "news/types/filter"

export const fetchFilters = async (): Promise<Array<any>> => {
    return new Promise(async (resolve, reject) => {
        try {
            // @ts-ignore
            const rsp = await fetch(window.API_BASE_URL + "/news/filter/")
            rsp.ok ? resolve(await rsp.json()) : reject(rsp.status)
        } catch(err) {
            reject(err)
        }
    })
}

// TODO: Modify these methods
export const updateFilter = async (filter: Filter, method: 'post'|'patch'|'delete'): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const options = { method: method }
            if (method == "post" || method == "patch") {
                options['body'] = JSON.stringify({ entry: filter.entry, part: filter.part, feed: filter.feed })
                options['headers'] = { "Content-Type": "application/json" }
            }
            // @ts-ignore
            const rsp = await fetch(window.API_BASE_URL +
                "/news/filter/" + (filter.id ? (filter.id + "/") : ""), options)
            if (rsp.ok) {
                try {
                    method == 'post' ? resolve((await rsp.json()).id) : resolve(null)
                } catch (err) {
                    resolve(null)
                }
            } else {
                reject(rsp.status)
            }
        } catch(err) {
            reject(err)
        }
    })
}