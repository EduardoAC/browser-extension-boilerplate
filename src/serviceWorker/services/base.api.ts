import { ApiError } from "./ApiError.class"
import {
  hasOnGoingRequests,
  lockResourceByUrl,
  notifyOnGoingRequestQueued,
  waitUntilOnGoingRequestFinish,
} from "./concurrentQueue"

type Parameter = string[] | string | number | boolean | null

interface QueryParameters {
  [key: string]: Parameter
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
  constructor() {}
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
  protected async concurrentRequests(
    requestUrl: string,
    headers: Headers,
    reqOptions: QueryParameters
  ) {
    let response: Response
    if (!hasOnGoingRequests(requestUrl)) {
      lockResourceByUrl(requestUrl)
      const authHeaders = this.getAuthHeader(reqOptions)
      response = await fetch(requestUrl, {
        ...reqOptions,
        headers: { ...authHeaders, source: "browser-extension", ...headers },
      })
      notifyOnGoingRequestQueued(requestUrl, response)
    } else {
      response = await waitUntilOnGoingRequestFinish(requestUrl)
    }
    return response
  }
  protected async request(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    options: QueryParameters = { concurrentQueue: false }
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
    options: QueryParameters = { concurrentQueue: false }
  ) {
    return this.request(endpoint, queryParams, headers, options)
  }
  put(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    options: QueryParameters = { concurrentQueue: false }
  ) {
    options = { ...options, method: "PUT" }
    return this.request(endpoint, queryParams, headers, options)
  }
  post(
    endpoint: string,
    queryParams: QueryParameters,
    data: unknown = {},
    headers: Headers,
    options: QueryParameters = { concurrentQueue: false }
  ) {
    options = { ...options, method: "POST", body: JSON.stringify(data) }
    return this.request(endpoint, queryParams, headers, options)
  }
  patch(
    endpoint: string,
    queryParams: QueryParameters,
    data: unknown = {},
    headers: Headers,
    options: QueryParameters = { concurrentQueue: false }
  ) {
    options = { ...options, method: "PATCH", body: JSON.stringify(data) }
    return this.request(endpoint, queryParams, headers, options)
  }
  delete(
    endpoint: string,
    queryParams: QueryParameters,
    headers: Headers,
    options: QueryParameters = { concurrentQueue: false }
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
  getAuthHeader(requestOptions: QueryParameters) {
    // const accessToken = getAccessToken()
    console.log(requestOptions)
    return {
      Authorization: "",
    }
  }
}
