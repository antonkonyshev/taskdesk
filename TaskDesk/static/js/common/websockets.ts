import { useWebSocket, UseWebSocketReturn } from "@vueuse/core"

export const prepareWebSocket = (
    socket: UseWebSocketReturn<any>, url: string,
    callback: (ws: WebSocket, event: MessageEvent) => Promise<void>
): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            if (!socket || !socket.status || socket.status.value == "CLOSED") {
                // @ts-ignore
                socket = useWebSocket(window.API_BASE_URL + url, {
                    autoReconnect: { retries: 3, delay: 3000, onFailed: reject },
                    onMessage: callback,
                })
            }
            resolve(socket)
        } catch(err) {
            reject(err)
        }
    })
}

export const closeWebSocket = (socket: UseWebSocketReturn<any>): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            if (socket) {
                if (socket.status && socket.status.value != "CLOSED") {
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