<p align="center"><img src='./docs/vite-plugin-dev.svg' width="474px" height="98px"/></p>

---

[![npm version](https://img.shields.io/npm/v/vite-plugin-dev-endpoint?color=blue)](https://www.npmjs.org/package/vite-plugin-dev-endpoint) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/mit-license.php) ![](https://img.shields.io/badge/TypeScript-support-orange.svg) 

---

Integrate Mock API Capacity with Vite

## Install

```sh
# npm
npm i -D vite-plugin-dev-endpoint

# yarn
yarn add -D vite-plugin-dev-endpoint

# pnpm
pnpm i -D vite-plugin-dev-endpoint
```

## Usage
```js
import { defineConfig } from "vite";
import devEndpoint from "vite-plugin-dev-endpoint";
import fakeResponse from "./assets/fake-response.json";

export default defineConfig({
  server: {
    port: 10880,
  },
  plugins: [
    devEndpoint({
      "/jsonAPI": {
        type: "json",
        data: fakeResponse,
      },
      "/textAPI": {
        type: "text",
        data: '123'
      },
      "mp3": {
        type: "file",
        path: "/home/user/assets/listen.mp3"
      }
    }),
  ],
});
```


The All Config Like below:
```ts
export type Config =(
  | {
    type: 'text';
    data: string;
  }
  | {
      type: "json"
      data: object;
    }
  | {
      type: "file";
      path: string;
    }
  | {
      type: "error";
      statusCode: number;
    }
  | {
    type: 'custom';
    handler: NextHandleFunction | HandleFunction;
  }) & {
    // By default, vite-plugin-dev-endpoint will provide a suitable content-type
    // in response header according to `type` or file extension name.
    // If you want to appoint a special content-type, you can set it.
    contentType?: string; 
  }

export type Endpoint = {
  [path: string]: Config;
};

```

