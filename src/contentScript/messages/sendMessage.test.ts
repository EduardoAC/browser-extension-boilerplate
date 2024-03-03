/* eslint-disable @typescript-eslint/no-explicit-any */
import * as chrome from "vitest-chrome"

import { sendMessage } from "./sendMessage"

describe("sendMessage", () => {
  it("should send the message correctly", () => {
    const message: Message = { type: "counter", subType: "get" }
    const response: MessageResponse = { statusCode: 200, data: 2 }
    const callbackSpy = vi.fn()

    console.log(chrome.runtime)
    chrome.runtime.sendMessage.mockImplementation(
      (_message: any, callback: any): Promise<unknown> => {
        return callback(response)
      }
    )

    sendMessage(message)

    expect(chrome.runtime.sendMessage).toBeCalledWith(message, callbackSpy)
    expect(callbackSpy).toBeCalledWith(response)
  })
})
