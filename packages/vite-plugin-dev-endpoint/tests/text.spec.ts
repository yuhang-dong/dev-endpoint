import { test, expect } from "@playwright/test";
import fs from "node:fs"
import path, {dirname} from "node:path"
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe("When request `JSON` endpoint", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/")
  });

  test("should return text/plain header", async ({page}) => {
    const contentTypeHeader = await page.evaluate(() => fetch('/text').then(res => res.headers.get('Content-Type')));
    expect(contentTypeHeader).toEqual('text/plain')
  });

  test("should equal provided json data", async ({page}) => {
    const body = await page.evaluate(() => fetch('/text').then(res => res.text()));
    expect(body).toEqual("123")
  })
});
