import { contentScriptDom } from "./constants"
import { createShadowRoot } from "./utils/shadow"
import "./index.css"
import { createRoot } from "react-dom/client"
import App from "./App"
import { StrictMode } from "react"

function initialiseContainer() {
    const cssBundle = chrome.runtime.getURL("bundle.css")
    // Initialise container if it's not present
    const appContainer = document.createElement("chrome-extension-boilerplate")
    appContainer.id = contentScriptDom
    const shadowRoot = createShadowRoot(appContainer, cssBundle)
    // Mitigate any styles targeting body by injecting element as html child
    document.head.insertAdjacentElement("afterend", appContainer)
    // Initialise React App
    createRoot(shadowRoot).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
}

initialiseContainer()
