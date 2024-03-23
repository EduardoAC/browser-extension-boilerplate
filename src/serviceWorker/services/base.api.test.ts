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
  // describe("Request methods", () => {})
  // describe("Concurrency queue", () => {})
  // describe("Options", () => {})
})
