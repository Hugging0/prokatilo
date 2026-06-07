import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readLegalText(fileName: string) {
  return readFileSync(
    join(process.cwd(), "public", "legal", fileName),
    "utf8",
  );
}
