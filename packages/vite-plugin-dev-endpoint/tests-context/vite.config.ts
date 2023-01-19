import { defineConfig } from "vite";
import devEndpoint from "../src/index";
import fakeResponse from "./assets/fake-response.json";

export default defineConfig({
  server: {
    port: 10880,
  },
  plugins: [
    devEndpoint({
      "/json": {
        type: "json",
        data: fakeResponse,
      },
      "/text": {
        type: "text",
        data: '123'
      }
    }),
  ],
});
