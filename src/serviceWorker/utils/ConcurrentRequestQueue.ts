// Configuration interface for the ConcurrentRequestQueue
export interface ConcurrentRequestQueueConfig {
    timeoutMs: number // Timeout value in milliseconds
}

// Function type for resolver functions
type ResolverFunction = (response: Response) => void

// Interface for the value stored in the concurrentQueueMap
interface ConcurrentQueueMapValue {
    resolve: ResolverFunction // Resolver function to resolve the promise
    timeoutId: NodeJS.Timeout // Timeout ID for managing timeouts
}

// Class representing a concurrent request queue
export class ConcurrentRequestQueue {
    private concurrentQueueMap: Map<string, ConcurrentQueueMapValue[]> // Map to store queued requests
    private config: ConcurrentRequestQueueConfig // Configuration for the queue

    // Constructor to initialize the queue with a configuration
    constructor(config: ConcurrentRequestQueueConfig) {
        this.concurrentQueueMap = new Map<string, ConcurrentQueueMapValue[]>() // Initialize the map
        this.config = config // Set the configuration
    }

    // Method to check if there are ongoing requests for a given URL
    hasOnGoingRequests(url: string): boolean {
        return this.concurrentQueueMap.has(url)
    }

    // Method to lock a resource (URL) for concurrent requests
    lockResourceByUrl(url: string): void {
        if (this.hasOnGoingRequests(url)) {
            throw new Error(`Resource already locked for ${url}`)
        }
        this.concurrentQueueMap.set(url, []) // Set an empty array for the URL to indicate it's locked
    }

    // Method to wait until an ongoing request for a URL finishes
    async waitUntilOnGoingRequestFinish(url: string): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(
                    new Error(
                        `Timeout exceeded while waiting for request to finish for URL: ${url}`,
                    ),
                )
                this.removeRequestFromQueue(url, timeoutId) // Remove the request from the queue on timeout
            }, this.config.timeoutMs) // Apply timeout based on configuration

            const currentQueueRequests = this.concurrentQueueMap.get(url) ?? []
            currentQueueRequests.push({ resolve, timeoutId }) // Add resolver function and timeout ID to the queue
            this.concurrentQueueMap.set(url, currentQueueRequests) // Update the queue
        })
    }

    // Method to notify queued requests that an ongoing request has been completed
    notifyOnGoingRequestQueued(url: string, response: Response): void {
        const currentQueueRequests = this.concurrentQueueMap.get(url)
        if (currentQueueRequests && currentQueueRequests.length > 0) {
            currentQueueRequests.forEach(({ resolve, timeoutId }) => {
                clearTimeout(timeoutId) // Clear timeout when response is received
                resolve(response.clone()) // Resolve the promise with the response
            })
        }
        this.concurrentQueueMap.delete(url) // Remove the URL from the queue
    }

    // Method to clear the entire ongoing request queue
    clearOnGoingRequestQueue(): void {
        this.concurrentQueueMap.clear()
    }

    // Private method to remove a specific request from the queue
    private removeRequestFromQueue(
        url: string,
        timeoutId: NodeJS.Timeout,
    ): void {
        const currentQueueRequests = this.concurrentQueueMap.get(url)
        if (currentQueueRequests) {
            const index = currentQueueRequests.findIndex(
                (request) => request.timeoutId === timeoutId,
            )
            if (index !== -1) {
                currentQueueRequests.splice(index, 1) // Remove the request from the queue
                if (currentQueueRequests.length === 0) {
                    this.concurrentQueueMap.delete(url) // Delete the URL entry if no more requests are queued
                }
            }
        }
    }
}
