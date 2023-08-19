# flowchain

(Work in Progress)

flowchain is a Node-based website project designed to work with large language models (LLMs). It leverages [react-flow](https://reactflow.dev/) for making custom nodes and [fp-ts](https://gcanti.github.io/fp-ts/) for functional programming paradigms. Each node in the flowchain acts as a part of LLM application . This project is a major work in progress, so expect bugs and/or missing features. 

## Features

- Node-based UI built with react-flow.
- Functional programming using fp-ts.
- Ability to create, modify, and update prompts to interact with LLMs.
- A highly customizable platform for experimenting with LLM-based applications.

### Current Status:

- [x] Save/Load: Finished
- [x] Node-based editing: Finished
- [x] Lazy OpenAI Node: Finished
- [x] Dynamic Prompt Node: Finished
- [x] Different Input Type: Finished
- [x] Better type management with fp-ts: Finished
- [ ] More to come...

## Installation

Clone the repository:

```bash
$ git clone https://github.com/yourusername/flowchain.git
$ cd flowchain
```

Install the dependencies:

```bash
$ npm install
```

## How to Run Locally

You can start the development server with the following command:

```bash
$ npm run dev
```

Navigate to `http://localhost:5173/` to view the project in your browser.

## License

This project is licensed under the MIT License.
---
