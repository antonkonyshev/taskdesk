import { Ref } from "vue"
import { useWebSocket, UseWebSocketReturn } from "@vueuse/core"

export const prepareWebSocket = async (
    socket: Ref<any>, url: string,
    callback: (ws: WebSocket, event: MessageEvent) => void
): Promise<Ref<UseWebSocketReturn<any>>> => {
    return new Promise((resolve, reject) => {
        try {
            if (!socket.value || !socket.value.status.value) {
                // @ts-ignore
                socket.value = useWebSocket(window.API_BASE_URL + url, {
                    autoReconnect: { retries: 3, delay: 3000, onFailed: reject },
                    onMessage: callback,
                })
            } else if (socket.value && socket.value.status.value == "CLOSED") {
                socket.value.open()
            }
            resolve(socket)
        } catch(err) {
            reject(err)
        }
    })
}

export const closeWebSocket = (socket: Ref<any>): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            if (socket) {
                if (socket.value.status && socket.value.status.value != "CLOSED") {
                    socket.value.close()
                }
                resolve()
            }
        } catch(err) {
            reject(err)
        }
    })
}