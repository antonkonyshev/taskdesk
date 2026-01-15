import { useNewsStore } from "news/store/news"
import { prepareWebSocket, closeWebSocket } from "TaskDesk/js/common/websockets"


let socket = null

const receiveMessage = async (ws: WebSocket, event: MessageEvent) => {
    console.log(JSON.parse(event.data))
}

export const prepareNewsSocket = (): Promise<any> => {
    return prepareWebSocket(socket, "/news/", receiveMessage)
}

export const closeNewsSocket = (): Promise<void> => {
    return closeWebSocket(socket)
}