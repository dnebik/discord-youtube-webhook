import * as fs from "node:fs";

const FILENAME = "store.json";

function readJson(): any {
  try {
    const value = fs.readFileSync(FILENAME, "utf8");
    return JSON.parse(value);
  } catch (e) {
    return {};
  }
}

export function saveId(key: string, id: string | number) {
  const data = readJson();
  data[key] = id;
  fs.writeFileSync("store.json", JSON.stringify(data), {
    encoding: "utf-8",
    flag: "w",
  });
}

export function readId(key: string) {
  return readJson()[key]?.trim() || null;
}
