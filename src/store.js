import * as fs from "fs";

export function saveId(id) {
  fs.writeFileSync("id.txt", id, {
    encoding: "utf-8",
    flag: "w",
  });
}

export function readId() {
  try {
    const id = fs.readFileSync("id.txt", "utf-8");
    return id.trim();
  } catch (e) {
    return null;
  }
}
