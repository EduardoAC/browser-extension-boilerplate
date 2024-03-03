import { useState } from "react"
import reactLogo from "@assets/react.svg"
import styles from "./App.css?inline"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <style>{styles}</style>
      <div className="chrome-extension-boilerplate">
        <a href="https://react.dev" target="_blank">
          <img
            src={chrome.runtime.getURL(reactLogo)}
            className="logo react"
            alt="React logo"
          />
        </a>
        <h1 className="title">Vite + React + Chrome extension boilerplate</h1>
        <div className="card">
          <p className="card__content">
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </div>
    </>
  )
}

export default App
