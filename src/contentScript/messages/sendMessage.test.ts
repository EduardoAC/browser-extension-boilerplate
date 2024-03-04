/* eslint-disable @typescript-eslint/no-explicit-any */

import { sendMessage } from "./sendMessage"

describe("sendMessage", () => {
  it("should send the message correctly", async () => {
    const message: Message = { type: "counter", subType: "get" }
    const response: MessageResponse = { statusCode: 200, data: 2 }

    console.log(chrome.runtime)
    chrome.runtime.sendMessage.mockImplementation(
      (_message: any, callback: any): void => {
        callback(response)
      }
    )

    const promiseResult = await sendMessage(message)

    expect(promiseResult).toEqual(2)
    expect(chrome.runtime.sendMessage).toBeCalledWith(
      message,
      expect.any(Function)
    )
  })
})
