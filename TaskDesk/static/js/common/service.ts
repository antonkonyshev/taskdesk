import { Entity } from 'TaskDesk/js/common/types/entity'


export const fetchItems = async (endpoint: string): Promise<Array<Entity>> => {
    return new Promise(async (resolve, reject) => {
        try {
            // @ts-ignore
            const rsp = await fetch(window.API_BASE_URL + endpoint)
            rsp.ok ? resolve(await rsp.json()) : reject(rsp.status)
        } catch(err) {
            reject(err)
        }
    })
}

export const updateItem = async (
    item: Entity, method: 'post'|'delete', endpoint: string,
): Promise<Entity> => {
    return new Promise(async (resolve, reject) => {
        try {
            const options = { method: method, headers: {
                "Content-Type": "application/json",
                // @ts-ignore
                "X-CSRFToken": window.CSRFTOKEN,
                credentials: 'include',
            }}
            if (method == "post") {
                options['body'] = JSON.stringify(item)
            }
            // @ts-ignore
            const rsp = await fetch(window.API_BASE_URL + endpoint, options)
            if (rsp.ok) {
                try {
                    method == 'post' ? resolve(await rsp.json()) : resolve(null)
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