/* eslint-disable @typescript-eslint/ban-types */
type OnGoingRequests = { [key in string]: Function[] }

let onGoingRequests: OnGoingRequests = {}
export function hasOnGoingRequests(url: string) {
  return typeof onGoingRequests[url] !== "undefined"
}

export function lockResourceByUrl(url: string) {
  if (!onGoingRequests[url]) {
    onGoingRequests[url] = []
  }
}

export function waitUntilOnGoingRequestFinish(url: string) {
  const waitForRequestPromise = new Promise<Response>((resolve) => {
    onGoingRequests[url].push(resolve)
  })
  return waitForRequestPromise
}

export function notifyOnGoingRequestQueued(url: string, response: Response) {
  if (
    typeof onGoingRequests[url] !== "undefined" &&
    onGoingRequests[url].length > 0
  ) {
    onGoingRequests[url].forEach((resolve) => {
      resolve(response.clone())
    })
  }
  delete onGoingRequests[url]
}

export function clearOnGoingRequestQueue() {
  onGoingRequests = {}
}
