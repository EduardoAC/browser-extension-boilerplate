import { appRootId } from "../constants"

function attachStyleToShadowDom(shadowWrapper: ShadowRoot, cssURL: string) {
    // create variable to attach the tailwind stylesheet
    const link = document.createElement("link")

    // attach the stylesheet as text
    link.rel = "stylesheet"
    link.href = cssURL

    // apply the style
    shadowWrapper.appendChild(link)
}

export function createShadowRoot(root: Element, cssURL: string) {
    // Set shadow root inside of root element
    const shadowRoot = root.attachShadow({ mode: "open" })
    root.appendChild(shadowRoot)
    // Add React App root node and styles
    const rootIntoShadow = document.createElement("div")
    rootIntoShadow.id = appRootId
    shadowRoot.appendChild(rootIntoShadow)
    attachStyleToShadowDom(shadowRoot, cssURL)
    return rootIntoShadow
}
