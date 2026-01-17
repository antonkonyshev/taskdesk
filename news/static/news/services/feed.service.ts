import { Feed } from 'news/types/feed'

export const fetchFeeds = async (): Promise<Array<any>> => {
    return new Promise(async (resolve, reject) => {
        try {
            // @ts-ignore
            const rsp = await fetch(window.API_BASE_URL + "/feed/")
            rsp.ok ? resolve(await rsp.json()) : reject(rsp.status)
        } catch(err) {
            reject(err)
        }
    })
}

export const updateFeed = async (feed: Feed, method: 'post'|'delete'): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const options = { method: method }
            if (method == "post") {
                options['body'] = JSON.stringify({ url: feed.url, title: feed.title })
            }
            options['headers'] = {
                "Content-Type": "application/json",
                // @ts-ignore
                "X-CSRFToken": window.CSRFTOKEN
            }
            options['credentials'] = 'include'
            // @ts-ignore
            const rsp = await fetch(window.API_BASE_URL +
                "/feed/" + (feed.id ? (feed.id + "/") : ""), options)
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