import { useWebSocket, UseWebSocketReturn } from "@vueuse/core"

export const prepareWebSocket = async (
    socket: UseWebSocketReturn<any>, url: string,
    callback: (ws: WebSocket, event: MessageEvent) => void
): Promise<UseWebSocketReturn<any>> => {
    return new Promise((resolve, reject) => {
        try {
            if (!socket || !socket.status.value) {
                // @ts-ignore
                socket = useWebSocket(window.API_BASE_URL + url, {
                    autoReconnect: { retries: 3, delay: 3000, onFailed: reject },
                    onMessage: callback,
                })
            } else if (socket && socket.status.value == "CLOSED") {
                socket.open()
            }
            resolve(socket)
        } catch(err) {
            reject(err)
        }
    })
}

export const closeWebSocket = (
    socket: UseWebSocketReturn<any>
): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            if (socket) {
                if (socket.status && socket.status.value != "CLOSED") {
                    socket.close()
                }
                resolve(socket)
            }
        } catch(err) {
            reject(err)
        }
    })
}