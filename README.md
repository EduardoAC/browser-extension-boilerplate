# React + TypeScript + Vite + Chrome extension + CXRJS plugin boilerplate

This repository aims to provide a quick starting point for building Chrome extensions in React. Please note that this is a pre-alpha project, so exercise caution before forking it, as it is not yet ready for general use. If you find something useful, feel free to copy and reproduce it at your own discretion, but be aware that it will be at your own risk.

Now that the disclosure is complete, this project aims to offer an easy way to create complex extensions with a simple fork, incorporating the following features:

- [x] Basic Message handling
- [ ] Basic Error handling
- [x] Advance API service, including the following features
  - [x] Concurrency handler with Error handler
  - [ ] Support for authentication through headers
  - [x] Wrapper around fetch method to simplify usage GET, PUT, POST and DELETE
  - [x] Support for streaming requests (Caveat we wait for the whole stream to finish fetching)
- [ ] Support for Single Sign-On through cookies
- [x] CSS injection into React Shadow
- [x] Support testing using Vitest
- [ ] Add acceptance tests using puppeteer (Puppeteer over playwright for more API control)
- and much more

## Additional Notes

- [x] Setup Vite
- [x] Setup deployment and HMR in extension - using CXRJS
- [x] Load React in Content Script considering there is not index.html
- [x] Introduce Shadow dom and styles for the component
- [x] Global styles to use within every page (Not required)

## Tech debt to address

- [x] concurrentQueue.ts is a series of functions that handle the queue but needs an elegant and reusable interface. Revisit this file and create a cleaner implementation using Classes or Prototyping TBD.
- [x] Base.api.ts is a bit big and serve multiple purposes, revisit the file and consider extract functionality like `mapParamsToApiNames` and `concurrent `concurrentRequests` so it can be better unit test it.
- [x] concurrentQueue.ts is a series of functions that handle the queue but needs an elegant and reusable interface. Revisit this file and create a cleaner implementation using Classes or Prototyping TBD.
- [x] Base.api.ts is a bit big and serves multiple purposes
  - [x] Revisit the file and consider extracting functionality like `mapParamsToApiNames` and `concurrent `concurrentRequests` so it can be better unit tested.
  - [x] Clear parameters part, it's not elegant to have to pass `{}` when we don't require additional query parameters and headers
