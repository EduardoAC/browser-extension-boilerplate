import { ConcurrentRequestQueue } from "./ConcurrentRequestQueue"

const requestUrl = "http://www.concurrent.com/request"
const timeoutMs = 5000 // Example timeout value

describe("Concurrent Request Queue", () => {
    let queue: ConcurrentRequestQueue

    beforeEach(() => {
        queue = new ConcurrentRequestQueue({ timeoutMs })
        queue.clearOnGoingRequestQueue()
    })

    describe("Multiple requests for the same URL at different times", () => {
        it("should proceed to make the request without queuing", () => {
            // Attempt same request after the previous has finished
            for (let i = 0; i < 3; i++) {
                expect(queue.hasOnGoingRequests(requestUrl)).toBeFalsy()
                queue.lockResourceByUrl(requestUrl)
                expect(queue.hasOnGoingRequests(requestUrl)).toBeTruthy()
                queue.notifyOnGoingRequestQueued(requestUrl, new Response())
            }
        })
    })

    describe("Multiple requests for the same URL at the same time", () => {
        it("should queue the subsequent requests", async () => {
            expect(queue.hasOnGoingRequests(requestUrl)).toBeFalsy()
            queue.lockResourceByUrl(requestUrl)
            expect(queue.hasOnGoingRequests(requestUrl)).toBeTruthy()
            const resultRequest = new Response(requestUrl, { status: 200 })
            const secondRequestPromise =
                queue.waitUntilOnGoingRequestFinish(requestUrl)
            queue.notifyOnGoingRequestQueued(requestUrl, resultRequest)
            await secondRequestPromise
            expect(queue.hasOnGoingRequests(requestUrl)).toBeFalsy()
        })

        it("should return the same response to all the requests avoiding additional API calls", async () => {
            // Data is already available not need for the request in the queue to fetch the information again
            queue.lockResourceByUrl(requestUrl)
            const resultRequest = new Response(requestUrl, { status: 200 })
            const secondRequestPromise =
                queue.waitUntilOnGoingRequestFinish(requestUrl)
            queue.notifyOnGoingRequestQueued(requestUrl, resultRequest)
            const expectedResponse = await secondRequestPromise
            expect(resultRequest.url).toBe(expectedResponse.url)
            expect(resultRequest.status).toBe(expectedResponse.status)
        })
    })
})
