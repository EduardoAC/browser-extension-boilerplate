/* eslint-disable @typescript-eslint/ban-types */
export class ConcurrentRequestQueue {
  private concurrentQueueMap: Map<string, Function[]>

  constructor() {
    this.concurrentQueueMap = new Map<string, Function[]>()
  }

  hasOnGoingRequests(url: string): boolean {
    return this.concurrentQueueMap.has(url)
  }

  lockResourceByUrl(url: string): void {
    if (this.hasOnGoingRequests(url)) {
      throw new Error(`Resource already locked for ${url}`)
    }
    this.concurrentQueueMap.set(url, [])
  }

  async waitUntilOnGoingRequestFinish(url: string): Promise<Response> {
    return new Promise<Response>((resolve) => {
      const currentQueueRequests = this.concurrentQueueMap.get(url) ?? []
      currentQueueRequests.push(resolve)
      this.concurrentQueueMap.set(url, currentQueueRequests)
    })
  }

  notifyOnGoingRequestQueued(url: string, response: Response): void {
    const currentQueueRequests = this.concurrentQueueMap.get(url)
    if (currentQueueRequests && currentQueueRequests.length > 0) {
      currentQueueRequests.forEach((resolve) => {
        resolve(response.clone())
      })
    }
    this.concurrentQueueMap.delete(url)
  }

  clearOnGoingRequestQueue(): void {
    this.concurrentQueueMap.clear()
  }
}
