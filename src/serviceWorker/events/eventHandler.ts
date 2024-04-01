import { counterMessageHandler } from "./onMessageHandlers/counterMessageHandler"

export function messageHandler(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: SendResponseCallback,
) {
    if (sender.tab && message.type) {
        switch (message.type) {
            case "counter":
                counterMessageHandler(message, sendResponse)
                break
            default:
                return false
        }
        return true // We will process the messages asynchronously
    }
    return false
}
