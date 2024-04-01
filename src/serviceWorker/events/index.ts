import { messageHandler } from "./eventHandler"

export function initialiseEvents() {
    chrome.runtime.onMessage.addListener(messageHandler)
}
