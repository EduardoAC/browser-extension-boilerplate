import { ApiError } from "./ApiError.class"
import {
  ConcurrentRequestQueue,
  ConcurrentRequestQueueConfig,
} from "./ConcurrentRequestQueue"

type Parameter = string[] | string | number | boolean | null

interface QueryParameters {
  [key: string]: Parameter
}

interface BaseAPIRequestOptions extends Partial<Request> {
  concurrentQueue: boolean
}

interface MappingAPIParam {
  apiName: string
  valueMapFn(param: Parameter): Parameter
  removeEmpty: boolean
}

interface Headers {
  [key: string]: Omit<Parameter, "string[]">
}

export class BaseApi {
  protected defaultOptions = {}
  protected concurrentRequestQueue: ConcurrentRequestQueue

  constructor(config: ConcurrentRequestQueueConfig = { timeoutMs: 5000 }) {
    this.concurrentRequestQueue = new ConcurrentRequestQueue(config)
  }
  protected onRequestFailed(response: Response) {
    const isUnauthenticated = response.status === 401
    const isUnauthorised = response.status === 403

    if (isUnauthenticated) {
      return new ApiError("Not authenticated", response)
    }

    if (isUnauthorised) {
      return new ApiError("Not authorised", response)
    }

    return new ApiError("Unknown API Error", response)
  }
  /**
   * Performs a concurrent request using the provided URL, headers, and request options.
   * Queues the request if there are ongoing requests for the same URL.
   * @param requestUrl The URL to make the request to.
   * @param headers The headers to include in the request.
   * @param reqOptions The request options.
   * @returns A Promise resolving to the response object.
   */
  protected async concurrentRequests(
    requestUrl: string,
    headers: Headers,
    reqOptions: Partial<Request>
  ) {
    let response: Response
    if (!this.concurrentRequestQueue.hasOnGoingRequests(requestUrl)) {
      this.concurrentRequestQueue.lockResourceByUrl(requestUrl)
      const authHeaders = this.getAuthHeader(reqOptions)
      response = await fetch(requestUrl, {
        ...reqOptions,
        headers: { ...authHeaders, source: "browser-extension", ...headers },
      })
      this.concurrentRequestQueue.notifyOnGoingRequestQueued(
        requestUrl,
        response
      )
    } else {
      response =
        await this.concurrentRequestQueue.waitUntilOnGoingRequestFinish(
          requestUrl
        )
    }
    return response
  }
  protected async request(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    options: BaseAPIRequestOptions = { concurrentQueue: false }
  ) {
    const { concurrentQueue, ...customOptions } = options
    const requestOptions = { ...this.defaultOptions, ...customOptions }

    try {
      const requestUrl = this.generateUrl(endpoint, queryParams)
      let response: Response
      if (concurrentQueue) {
        response = await this.concurrentRequests(
          requestUrl,
          headers,
          requestOptions
        )
      } else {
        const authHeaders = this.getAuthHeader(requestOptions)
        response = await fetch(requestUrl, {
          ...requestOptions,
          headers: {
            ...authHeaders,
            source: "browser-extension", // Custom header to track request origin
            ...headers,
          },
        })
      }
      if (!response.ok) {
        return Promise.reject(this.onRequestFailed(response))
      }

      const data = await response.json()

      return Promise.resolve({
        status: response.status,
        data: data,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof ApiError) {
        return Promise.reject(error)
      }
      throw new Error(error)
    }
  }
  get(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    options: BaseAPIRequestOptions = { concurrentQueue: false }
  ) {
    return this.request(endpoint, queryParams, headers, options)
  }
  put(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    data: unknown,
    options: BaseAPIRequestOptions = { concurrentQueue: false }
  ) {
    options = {
      ...options,
      method: "PUT",
      // Temporary cast conversion as RequestInfo doesn't accept strings as type
      body: JSON.stringify(data) as unknown as ReadableStream<Uint8Array>,
    }
    return this.request(endpoint, queryParams, headers, options)
  }
  post(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    data: unknown,
    options: BaseAPIRequestOptions = { concurrentQueue: false }
  ) {
    options = {
      ...options,
      method: "POST",
      // Temporary cast conversion as RequestInfo doesn't accept strings as type
      body: JSON.stringify(data) as unknown as ReadableStream<Uint8Array>,
    }
    return this.request(endpoint, queryParams, headers, options)
  }
  patch(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    data: unknown,
    options: BaseAPIRequestOptions = { concurrentQueue: false }
  ) {
    options = {
      ...options,
      method: "PATCH",
      // Temporary cast conversion as RequestInfo doesn't accept strings as type
      body: JSON.stringify(data) as unknown as ReadableStream<Uint8Array>,
    }
    return this.request(endpoint, queryParams, headers, options)
  }
  delete(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    options: BaseAPIRequestOptions = { concurrentQueue: false }
  ) {
    options = { ...options, method: "DELETE" }
    return this.request(endpoint, queryParams, headers, options)
  }
  protected generateUrl(
    endpoint: string,
    queryParams: QueryParameters
  ): string {
    const url = new URL(endpoint) // Available on the background script
    if (queryParams) {
      Object.keys(queryParams).forEach((field) => {
        const value = queryParams[field]
        if (Array.isArray(value)) {
          value.forEach((parameter) => {
            url.searchParams.append(`${field}[]`, parameter as string)
          })
        } else {
          url.searchParams.append(field, value as string)
        }
      })
    }
    return url.toString()
  }

  mapParamsToApiNames(
    params: QueryParameters = {},
    mapping: { [key: string]: MappingAPIParam }
  ) {
    const emptyValues: Parameter[] = ["", null]
    return Object.keys(mapping).reduce((apiParams: QueryParameters, key) => {
      const cfg = mapping[key]
      if (!params[key]) {
        return apiParams
      }

      const apiParamKey = cfg.apiName || key
      let apiParamValue = params[key]
      const hasEmptyValue = emptyValues.includes(apiParamValue)

      if (!cfg.removeEmpty || (cfg.removeEmpty && !hasEmptyValue)) {
        if (cfg.valueMapFn) {
          if (typeof cfg.valueMapFn !== "function") {
            throw new Error(
              `Expected valueMapFn to be a function in ${key} mapping config`
            )
          }
          apiParamValue = cfg.valueMapFn(apiParamValue)
        }
        apiParams[apiParamKey] = apiParamValue
      }
      return apiParams
    }, {})
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAuthHeader(requestOptions: Partial<Request>) {
    return {
      Authorization: "Auth",
    }
  }
}
