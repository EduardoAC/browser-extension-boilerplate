async function updateCacheCounter(
    sendResponse: SendResponseCallback,
    currentCount?: number,
): Promise<void> {
    if (typeof currentCount === "number") {
        try {
            await chrome.storage.local.set({ counter: currentCount })
            return sendResponse({ statusCode: 200 })
        } catch (error) {
            console.log("Update Cache failed", error)
            return sendResponse({ statusCode: 500 })
        }
    }
    sendResponse({ statusCode: 400 })
}

async function getCountFromCache(sendResponse: SendResponseCallback) {
    try {
        const counterObj = await chrome.storage.local.get(["counter"])
        return sendResponse({ statusCode: 200, data: counterObj.counter })
    } catch (error) {
        console.log("Failed to retrieved counter from cache", error)
        return sendResponse({ statusCode: 500 })
    }
}

export async function counterMessageHandler(
    message: Message<number>,
    sendResponse: SendResponseCallback,
) {
    if (message.subType) {
        switch (message.subType) {
            case "get":
                getCountFromCache(sendResponse)
                break
            case "update":
                updateCacheCounter(sendResponse, message.data)
                break
        }
        return
    }
    sendResponse({ statusCode: 405 })
}
