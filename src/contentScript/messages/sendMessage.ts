export async function sendMessage<T, V>(message: Message<T>) {
    return new Promise<V | undefined>((resolve, reject) => {
        try {
            chrome.runtime.sendMessage(
                message,
                (response: MessageResponse<V>) => {
                    if (response.statusCode === 200) {
                        resolve(response.data)
                    } else {
                        reject(response.data)
                    }
                },
            )
        } catch (error) {
            reject(error)
        }
    })
}
