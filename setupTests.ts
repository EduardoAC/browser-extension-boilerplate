// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
// vitest.init.js
import * as chrome from "vitest-chrome/lib/index.esm"

Object.assign(global, chrome)
