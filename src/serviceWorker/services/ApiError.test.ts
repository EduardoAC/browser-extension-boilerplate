import { ApiError } from "./ApiError.class"
describe("API Error class", () => {
    it("should provide the common Error data", () => {
        const apiError = new ApiError("test", new Response())
        expect(apiError.message).toBe("test")
        expect(apiError.name).toBe("ApiError")
        expect(apiError.stack).toBeDefined()
    })
    it("should provide basic response information", () => {
        const response = new Response("http://url.com", {
            status: 500,
            statusText: "Unexpected server error",
        })
        const apiError = new ApiError("Request error", response)
        expect(apiError.statusCode).toBe(500)
        expect(apiError.text).toBe("Unexpected server error")
    })
    it("should return a copy of the original response", () => {
        let response = new Response("http://url.com", {
            status: 500,
            statusText: "Unexpected server error",
        })
        const apiError = new ApiError("Request error", response)
        expect(apiError.response).toBe(response)
        response = new Response("http://another-url.com", { status: 200 })
        expect(apiError.response.status).toBe(500)
        expect(apiError.response.statusText).toBe("Unexpected server error")
    })
})
