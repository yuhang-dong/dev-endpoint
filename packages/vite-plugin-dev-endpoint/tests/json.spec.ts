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

  test("should return application/json header", async ({page}) => {
    const contentTypeHeader = await page.evaluate(() => fetch('/json').then(res => res.headers.get('Content-Type')));
    expect(contentTypeHeader).toEqual('application/json')
  });

  test("should equal provided json data", async ({page}) => {
    const body = await page.evaluate(() => fetch('/json').then(res => res.json()));
    const fakeResponse = fs.readFileSync(path.join(__dirname, '../tests-context/assets/fake-response.json'))
    expect(JSON.stringify(body)).toEqual(JSON.stringify(JSON.parse(fakeResponse.toString('utf-8'))))
  })
});
