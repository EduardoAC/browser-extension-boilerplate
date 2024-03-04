# React + TypeScript + Vite + Chrome extension + CXRJS plugin boilerplate

This repository aims to provide a quick starting point for building Chrome extensions in React. Please note that this is a pre-alpha project, so exercise caution before forking it, as it is not yet ready for general use. If you find something useful, feel free to copy and reproduce it at your own discretion, but be aware that it will be at your own risk.

Now that the disclosure is complete, this project aims to offer an easy way to create complex extensions with a simple fork, incorporating the following features:

- [x] Basic Message handling
- [ ] Basic Error handling
- [ ] Advance API service, including the following features
  - [ ] Concurrency handler with Error handler
  - [ ] Support for authentication through headers
  - [ ] Wrapper around fetch method to simplify usage GET, PUT, POST and DELETE
  - [ ] Support for streaming requests
- [ ] Support for Single Sign-On through cookies
- [ ] CSS modules injection into React Shadow
- [x] Support testing using Vitest
- and much more

Additional Notes

- [x] Setup Vite
- [x] Setup deployment and HMR in extension - using CXRJS
- [x] Load React in Content Script considering there is not index.html
- [x] Introduce Shadow dom and styles for the component
- [ ] Global styles to use within every page (Not required)
