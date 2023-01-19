import fs from "node:fs";
import exts from "./exts";
import pathModule from "node:path";
import { ServerResponse, OutgoingHttpHeaders } from "node:http";
import type { IncomingMessage } from "connect";

const noCache = false; // used for debug
const fileSizeCache = new Map<string, number>();

const getFileSize =  (path?: string) => {
  if (path) {
    if (!noCache && fileSizeCache.has(path)) {
      return fileSizeCache.get(path)!;
    } else {
      if (!fs.existsSync(path)) {
        return 0;
      }
      var stat = fs.statSync(path);
      if (!noCache) fileSizeCache.set(path, stat.size);

      return stat.size;
    }
  }
  return 0;
};

const getRange = function (req: IncomingMessage, total: number) {
  const range = [0, total, 0];
  const reqRangeInfo = req.headers ? req.headers.range : undefined;

  if (reqRangeInfo) {
    const reqRangeLoc = reqRangeInfo.indexOf("bytes=");
    if (reqRangeLoc >= 0) {
      const [start, end] = reqRangeInfo.substring(reqRangeLoc + 6).split("-");
      try {
        range[0] = parseInt(start);
        if (end && end.length) {
          range[1] = parseInt(end);
          range[1] = range[1] < 16 ? 16 : range[1];
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (range[1] == total) range[1]--;

    range[2] = total;
  }

  return range;
};


export type Ext = keyof typeof exts;
const isKeyOfExt = (key: string): key is Ext => {
  return key in exts;
};

export default (
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  type?: string,
  cb?: Function
) => {

  const total = getFileSize(path);

  if (total == 0) {
    res.statusCode = 404;
    res.end(path + " not found");
    console.error(path + " not found!")
    return;
  }

  const range = getRange(req, total);

  const ext = pathModule.extname(path).toLowerCase();
  if (!type && ext && ext.length && isKeyOfExt(ext)) {
    type = exts[ext];
  } else if(!type) {
    type = "text/plain";
    console.warn("Cannot find media format for " + pathModule.basename(path))
  }

  const file = fs.createReadStream(path, { start: range[0], end: range[1] });

  const cleanupFileStream = function () {
    file.close();
  };

  // the event emitted seems to change based on version of node.js
  // 'close' is fired as of v6.11.5
  res.on("close", cleanupFileStream); // https://stackoverflow.com/a/9021242
  res.on("end", cleanupFileStream); // https://stackoverflow.com/a/16897986
  res.on("finish", cleanupFileStream); // https://stackoverflow.com/a/14093091 - https://stackoverflow.com/a/38057516

  const header: OutgoingHttpHeaders = {
    "Content-Length": range[1],
    "Content-Type": type,
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "POST, GET, OPTIONS",
  };

  if (range[2] > 0) {
    header["Accept-Ranges"] = "bytes";
    header["Content-Range"] =
      "bytes " + range[0] + "-" + range[1] + "/" + total;
    header["Content-Length"] = range[2];

    res.writeHead(206, header);
  } else {
    res.writeHead(200, header);
  }

  file.pipe(res as unknown as NodeJS.WritableStream);
  file.on("close", function () {
    res.end(0);
    if (cb && typeof cb == "function") {
      cb(path);
    }
  });
};
