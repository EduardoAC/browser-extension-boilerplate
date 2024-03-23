import {
  clearOnGoingRequestQueue,
  hasOnGoingRequests,
  lockResourceByUrl,
  notifyOnGoingRequestQueued,
  waitUntilOnGoingRequestFinish,
} from "./concurrentQueue"

const requestUrl = "http://www.concurrent.com/request"

//hasOnGoingRequests
//lockResourceByUrl
//waitUntilOnGoingRequestFinish
//notifyOnGoingRequestQueued
//clearOnGoingRequestQueue
describe("Concurrent Queue", () => {
  beforeEach(() => {
    clearOnGoingRequestQueue()
  })
  describe("Multiple request for the same URL at different times", () => {
    it("should proceed to make the request without queuing", () => {
      // Attempt same request after the previous has finished
      for (let i = 0; i < 3; i++) {
        expect(hasOnGoingRequests(requestUrl)).toBeFalsy()
        lockResourceByUrl(requestUrl)
        expect(hasOnGoingRequests(requestUrl)).toBeTruthy()
        notifyOnGoingRequestQueued(requestUrl, new Response())
      }
    })
  })
  describe("Multiple requests for the same URL at the same time", () => {
    it("should queue the subsequent requests", async () => {
      expect(hasOnGoingRequests(requestUrl)).toBeFalsy()
      lockResourceByUrl(requestUrl)
      expect(hasOnGoingRequests(requestUrl)).toBeTruthy()
      const resultRequest = new Response(requestUrl, { status: 200 })
      // We cannot await directly as it will block test execution
      const secondRequestPromise = waitUntilOnGoingRequestFinish(requestUrl)
      notifyOnGoingRequestQueued(requestUrl, resultRequest)
      await secondRequestPromise
      expect(hasOnGoingRequests(requestUrl)).toBeFalsy()
    })
    it("should return the same response to all the requests avoiding additional API calls", async () => {
      // Data is already available not need for the request in the queue to fetch the information again
      lockResourceByUrl(requestUrl)
      const resultRequest = new Response(requestUrl, { status: 200 })
      const secondRequestPromise = waitUntilOnGoingRequestFinish(requestUrl)
      notifyOnGoingRequestQueued(requestUrl, resultRequest)
      const expectedResponse = await secondRequestPromise
      expect(resultRequest.url).toBe(expectedResponse.url)
      expect(resultRequest.status).toBe(expectedResponse.status)
    })
  })
})
