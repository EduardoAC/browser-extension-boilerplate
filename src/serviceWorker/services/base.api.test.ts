import { vi } from "vitest"
import { BaseApi } from "./base.api"

const viFn = vi.fn()

// This is the section where we mock `fetch`
const unmockedFetch = global.fetch
global.fetch = viFn

function createFetchResponse(data) {
  return { json: () => new Promise((resolve) => resolve(data)) }
}

const requestUrl = "http://www.url.com"

describe("Base Api", () => {
  afterAll(() => {
    global.fetch = unmockedFetch
  })
  beforeEach(() => {
    viFn.mockClear()
    viFn.mockResolvedValue(createFetchResponse({}))
  })
  describe("Headers customisation", () => {
    it("Headers provided are present in the API request", () => {
      const baseApiInstance = new BaseApi()
      baseApiInstance.get(requestUrl, {}, { test: "header" })
      expect(viFn).toBeCalledWith(`${requestUrl}/`, {
        headers: {
          Authorization: "",
          source: "browser-extension",
          test: "header",
        },
      })
    })
  })
  // describe("Authorisation", () => {})
  // describe("Request methods", () => {})
  // describe("Concurrency queue", () => {})
  // describe("Options", () => {})
})
