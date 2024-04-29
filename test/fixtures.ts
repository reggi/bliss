import { parse } from "jsr:@std/yaml@0.224.0";
import path from "node:path";

if (!import.meta.dirname) {
  throw new Error("import.meta.dirname not found");
}

const rawfixture = await Deno.readTextFile(
  path.join(import.meta.dirname, "./fixtures.yml")
);

export const fixtures = parse(rawfixture) as {
  comment: string;
  input: string;
  output: any;
}[];
