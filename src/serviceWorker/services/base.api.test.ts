import { vi } from "vitest"
import createFetchMock from "vitest-fetch-mock"
import { BaseApi } from "./base.api"

const fetchMocker = createFetchMock(vi)
const requestUrl = "http://www.url.com"

describe("Base Api", () => {
    beforeAll(() => {
        fetchMocker.enableMocks()
    })
    afterAll(() => {
        fetchMocker.disableMocks()
    })
    beforeEach(() => {
        fetchMocker.mockClear()
    })
    describe("Headers customisation", () => {
        it("Headers provided are present in the API request", () => {
            fetchMocker.mockResponseOnce(JSON.stringify({ data: "12345" }))
            const baseApiInstance = new BaseApi()
            baseApiInstance.get(requestUrl, { headers: { test: "header" } })
            expect(fetchMocker).toBeCalledWith(`${requestUrl}/`, {
                headers: {
                    Authorization: "Auth",
                    source: "browser-extension",
                    test: "header",
                },
            })
        })
        it("Authorization should be present on headers", () => {
            fetchMocker.mockResponseOnce(JSON.stringify({ data: "12345" }))
            const baseApiInstance = new BaseApi()
            baseApiInstance.get(requestUrl, {}, {})
            expect(fetchMocker).toBeCalledWith(`${requestUrl}/`, {
                headers: {
                    Authorization: "Auth",
                    source: "browser-extension",
                },
            })
        })
    })
    describe("Request methods", () => {
        it("should provide no method when sending a GET request", () => {
            fetchMocker.mockResponseOnce(JSON.stringify({ data: "12345" }))
            const baseApiInstance = new BaseApi()
            baseApiInstance.get(requestUrl)
            expect(fetchMocker).toBeCalledWith(`${requestUrl}/`, {
                headers: {
                    Authorization: "Auth",
                    source: "browser-extension",
                },
            })
        })
        it("should provide body and POST method when sending a POST request", () => {
            fetchMocker.mockResponseOnce(JSON.stringify({ success: true }))
            const baseApiInstance = new BaseApi()
            const body = { data: "to Store" }
            baseApiInstance.post(requestUrl, { body })
            expect(fetchMocker).toBeCalledWith(`${requestUrl}/`, {
                headers: {
                    Authorization: "Auth",
                    source: "browser-extension",
                },
                method: "POST",
                body: JSON.stringify(body),
            })
        })
        it("should provide body and PUT method when sending a PUT request", () => {
            fetchMocker.mockResponseOnce(JSON.stringify({ success: true }))
            const baseApiInstance = new BaseApi()
            const body = { id: 1, user: "test" }
            baseApiInstance.put(requestUrl, { body })
            expect(fetchMocker).toBeCalledWith(`${requestUrl}/`, {
                headers: {
                    Authorization: "Auth",
                    source: "browser-extension",
                },
                method: "PUT",
                body: JSON.stringify(body),
            })
        })
        it("should provide body and PATH method when sending a PATH request", () => {
            fetchMocker.mockResponseOnce(JSON.stringify({ success: true }))
            const baseApiInstance = new BaseApi()
            const body = { id: 1, user: "test" }
            baseApiInstance.patch(requestUrl, { body })
            expect(fetchMocker).toBeCalledWith(`${requestUrl}/`, {
                headers: {
                    Authorization: "Auth",
                    source: "browser-extension",
                },
                method: "PATCH",
                body: JSON.stringify(body),
            })
        })
        it("should provide DELETE method when sending a DELETE request", () => {
            fetchMocker.mockResponseOnce(JSON.stringify({ success: true }))
            const baseApiInstance = new BaseApi()
            baseApiInstance.delete(`${requestUrl}/id/1`)
            expect(fetchMocker).toBeCalledWith(`${requestUrl}/id/1`, {
                headers: {
                    Authorization: "Auth",
                    source: "browser-extension",
                },
                method: "DELETE",
            })
        })
        it("should handle json response correctly", async () => {
            const responseData = { data: "12345" }
            fetchMocker.mockResponseOnce(JSON.stringify(responseData))
            const baseApiInstance = new BaseApi()
            const response = await baseApiInstance.get(requestUrl, {
                options: { requestType: "json" },
            })
            expect(response).toEqual({
                status: 200,
                data: responseData,
            })
        })

        it("should handle stream response correctly", async () => {
            const responseData = "Stream Data"
            const responseInit = {
                status: 200,
                headers: { "Content-Type": "text/plain" },
            }
            const sharedResponse = new Response(responseData, responseInit)
            fetchMocker.mockImplementation(() =>
                Promise.resolve(sharedResponse),
            )
            const baseApiInstance = new BaseApi()
            const response = await baseApiInstance.get(requestUrl, {
                options: { requestType: "stream" },
            })
            const textEncoder = new TextEncoder()
            // Assuming response.data will be ArrayBuffer in this case
            expect(response).toStrictEqual({
                status: 200,
                data: new Uint8Array(textEncoder.encode(responseData)),
            })
        })

        it("should throw error for unknown request type", async () => {
            const baseApiInstance = new BaseApi()
            const invalidRequestType = "invalidType"
            await expect(async () => {
                await baseApiInstance.get(requestUrl, {
                    options: { requestType: invalidRequestType },
                })
            }).rejects.toThrow(`Request type unknown: ${invalidRequestType}`)
        })
    })
    describe("Concurrency queue", () => {
        it("should queue requests using the same URL until the first has finished and broadcast the result to all", async () => {
            const sharedResponse = new Response(
                JSON.stringify({ test: "test" }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                },
            )
            let resolveRequests
            const emulateConcurrencyPromise = new Promise<Response>(
                (resolve) => {
                    resolveRequests = resolve
                },
            )
            fetchMocker.mockImplementation(
                // Mock Implementation signature require us to wrap our promise
                async () => await emulateConcurrencyPromise,
            )
            const baseApiInstance = new BaseApi()
            const firstRequestPromise = baseApiInstance.get(requestUrl, {
                options: { concurrentQueue: true },
            })
            const secondRequestPromise = baseApiInstance.get(requestUrl, {
                options: { concurrentQueue: true },
            })
            resolveRequests(sharedResponse)
            // Wait for both promises to resolve before checking the output
            const [firstResponse, secondResponse] = await Promise.all([
                firstRequestPromise,
                secondRequestPromise,
            ])
            // Check that we have done a single API call
            expect(fetchMocker).toBeCalledTimes(1)
            expect(fetchMocker).toBeCalledWith(`${requestUrl}/`, {
                headers: {
                    Authorization: "Auth",
                    source: "browser-extension",
                },
            })
            // Check output from each request
            expect(firstResponse).toStrictEqual({
                status: 200,
                data: { test: "test" },
            })
            expect(secondResponse).toStrictEqual({
                status: 200,
                data: { test: "test" },
            })
        })
    })
})
