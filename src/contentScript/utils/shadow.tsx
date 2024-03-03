import { appRootId } from "../constants";

function attachStyleToShadowDom(shadowWrapper: ShadowRoot, cssContent: string) {
  // create variable to attach the tailwind stylesheet
  const style = document.createElement("style");

  // attach the stylesheet as text
  style.textContent = cssContent;

  // apply the style
  shadowWrapper.appendChild(style);
}

export function createShadowRoot(root: Element, styles: string) {
  // Set shadow root inside of root element
  const shadowRoot = root.attachShadow({ mode: "open" });
  root.appendChild(shadowRoot);
  // Add React App root node and styles
  const rootIntoShadow = document.createElement("div");
  rootIntoShadow.id = appRootId;
  shadowRoot.appendChild(rootIntoShadow);
  attachStyleToShadowDom(shadowRoot, styles);
  return rootIntoShadow;
}
