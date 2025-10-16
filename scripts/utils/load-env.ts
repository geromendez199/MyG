import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parse(contents: string) {
  const lines = contents.split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const [key, ...rest] = line.split("=");
    if (!key) continue;
    const value = rest.join("=").trim().replace(/^"|"$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function loadEnvFiles() {
  const files = [".env", `.env.${process.env.NODE_ENV ?? "development"}.local`, ".env.local"];
  for (const file of files) {
    const fullPath = resolve(process.cwd(), file);
    if (existsSync(fullPath)) {
      const contents = readFileSync(fullPath, "utf-8");
      parse(contents);
    }
  }
}

loadEnvFiles();
