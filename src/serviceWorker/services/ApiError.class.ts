export class ApiError extends Error {
    response: Response
    statusCode: number
    type: string
    text: string

    withText: (str: string) => boolean
    json: () => object
    constructor(message: string, response: Response) {
        super(message)
        Object.setPrototypeOf(this, ApiError.prototype)

        this.name = "ApiError"
        // Custom info
        this.response = response
        this.statusCode = response.status
        this.type = response.type
        this.text = response.statusText

        this.withText = (str: string) => this.text.indexOf(str) !== -1
        this.json = () => {
            try {
                return JSON.parse(this.text)
            } catch (error) {
                return {}
            }
        }
    }
}
