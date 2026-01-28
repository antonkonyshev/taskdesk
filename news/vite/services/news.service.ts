import { useNewsStore } from "news/store/news"
import { UseWebSocketReturn } from "@vueuse/core"
import { prepareWebSocket, closeWebSocket } from "TaskDesk/js/common/websockets"
import { News, NewsMeta } from "news/types/news"

let socket: UseWebSocketReturn<any> | null = null
let closeSocketTimeoutId = null
const newsSocketTimeout = 600000

export const receiveNews = (ws: WebSocket, event: MessageEvent) => {
    const data = JSON.parse(event.data)
    if (data.id == "meta") {
        useNewsStore().refreshNewsMeta(data as NewsMeta)
    } else {
        useNewsStore().refreshNews(data as News)
    }
}

export const renewNewsSocketTimeout = (): void => {
    clearTimeout(closeSocketTimeoutId)
    closeSocketTimeoutId = setTimeout(closeNewsSocket, newsSocketTimeout)
}

export const prepareNewsSocket = async () => {
    renewNewsSocketTimeout()
    socket = await prepareWebSocket(socket, "/news/", receiveNews)
    return socket
}

export const closeNewsSocket = (): Promise<void> => closeWebSocket(socket)