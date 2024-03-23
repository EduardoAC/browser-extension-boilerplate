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
      baseApiInstance.get(requestUrl, {}, { test: "header" })
      expect(fetchMocker).toBeCalledWith(`${requestUrl}/`, {
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
