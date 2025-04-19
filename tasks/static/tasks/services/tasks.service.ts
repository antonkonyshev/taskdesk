import { useWebSocket } from "@vueuse/core"

let socket = null

export const prepareTaskSocket = (uuid: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            if (!socket || socket.status == "CLOSED") {
                // @ts-ignore
                socket = useWebSocket(window.API_BASE_URL +
                    "/task/" + uuid + "/", {
                        autoReconnect: { retries: 3, delay: 3000, onFailed: reject }
                    })
            }
            resolve(socket)
        } catch(err) {
            reject(err)
        }
    })
}

export const closeTaskSocket = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            if (socket) {
                if (socket.status != "CLOSED") {
                    socket.close()
                }
                socket = null
                resolve()
            }
        } catch(err) {
            reject(err)
        }
    })
}

export const markTask = (uuid: string, method: 'post'|'delete'): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const options = { method: method }
            if (method == "post") {
                options['body'] = JSON.stringify({ uuid: uuid, done: true })
                options['headers'] = { "Content-Type": "application/json" }
            }
            // @ts-ignore
            const rsp = await fetch(window.API_BASE_URL +
                "/task/" + uuid + "/", options)
            rsp.ok ? resolve() : reject(rsp.status)
        } catch(err) {
            reject(err)
        }
    })
}

export const updateTask = (data): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            await prepareTaskSocket(data.uuid)
            socket.send(JSON.stringify(data))
            resolve()
        } catch(err) {
            reject(err)
        }
    })
}

export const annotateTask = async (data): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.uuid && data.annotate) {
                await prepareTaskSocket(data.uuid)
                socket.send(JSON.stringify(data))
            }
            resolve()
        } catch(err) {
            reject(err)
        }
    })
}

export const denotateTask = async (data): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.uuid && data.denotate) {
                await prepareTaskSocket(data.uuid)
                socket.send(JSON.stringify(data))
            }
            resolve()
        } catch(err) {
            reject(err)
        }
    })
}

export const fetchTasks = async (): Promise<Array<any>> => {
    return new Promise(async (resolve, reject) => {
        try {
            // @ts-ignore
            const rsp = await fetch(window.API_BASE_URL + "/task/")
            rsp.ok ? resolve(await rsp.json()) : reject(rsp.status)
        } catch(err) {
            reject(err)
        }
    })
}