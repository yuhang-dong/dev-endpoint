import { HandleFunction, NextHandleFunction } from "connect";
import { ViteDevServer } from "vite";
import ms from 'endpoint-file-server'

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
    contentType?: string;
  }

export type Endpoint = {
  [path: string]: Config;
};

export default (endpoint: Endpoint) => ({
  name: "dev-endpoint",
  configureServer(server: ViteDevServer) {
    for (const path in endpoint) {
      const config = endpoint[path];
      switch (config.type) {
        case "json": {
          server.middlewares.use(path, (_, res) => {
            res.setHeader("content-type", config.contentType || "application/json");
            res.end(JSON.stringify(config.data));
          });
          break;
        }
        case "text": {
          server.middlewares.use(path, (_, res) => {
            res.setHeader("content-type", config.contentType || "text/plain");
            res.end(config.data);
          });
          break;
        }
        case "file": {
          server.middlewares.use(path, (req, res) => {
            ms(req, res, config.path, config.contentType);
          });
          break;
        }
        case 'error': {
          server.middlewares.use(path, (_, res) => {
            res.statusCode = config.statusCode;
          });
          break;
        }
        case 'custom': {
          server.middlewares.use(path, config.handler);
          break;
        }
        default: {
          console.warn('[dev-endpoint] maybe you have a wrong config: ' + JSON.stringify(config));
        }
      }
    }
  },
});
