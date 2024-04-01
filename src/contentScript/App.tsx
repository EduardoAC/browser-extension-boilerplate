import { useCallback, useEffect, useState } from "react"
import reactLogo from "@assets/react.svg"
import "./App.css"
import { sendMessage } from "./messages/sendMessage"

function App() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        sendMessage<undefined, number>({
            type: "counter",
            subType: "get",
        }).then((previousCount?: number) => {
            if (typeof previousCount === "number") {
                setCount(previousCount)
            }
        })
    }, [])
    const handleClick = useCallback(() => {
        setCount(count + 1)
        sendMessage<number, undefined>({
            type: "counter",
            subType: "update",
            data: count + 1,
        })
    }, [count])

    return (
        <>
            <div className="chrome-extension-boilerplate">
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img
                        src={chrome.runtime.getURL(reactLogo)}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
                <h1 className="title">
                    Vite + React + Chrome extension boilerplate
                </h1>
                <div className="card">
                    <p className="card__content">
                        Edit <code>src/App.tsx</code> and save to test HMR
                    </p>
                    <button onClick={handleClick}>count is {count}</button>
                </div>
            </div>
        </>
    )
}

export default App
