import { useNewsStore } from "news/store/news"
import { prepareWebSocket, closeWebSocket } from "TaskDesk/js/common/websockets"

let socket = null

export const receiveNews = (ws: WebSocket, event: MessageEvent) => {
    useNewsStore().refreshNews(JSON.parse(event.data))
}

export const prepareNewsSocket = (): Promise<any> => prepareWebSocket(
    socket, "/news/", receiveNews)

export const closeNewsSocket = (): Promise<void> => closeWebSocket(socket)