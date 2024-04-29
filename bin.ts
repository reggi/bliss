import { parseArgs } from "jsr:@std/cli@0.224.0";
import path from "npm:path";
import { parseFunctions } from "./parse_functions.ts";
import { astSource } from "./ast_source.ts";
import { FunctionDef } from "./types.ts";
import { help as getHelp } from "./help.ts";
import { spreadable } from "./spreadable.ts";

const { _, help, ...argsObj } = parseArgs(Deno.args);
const file = _.shift();

if (typeof file !== "string") {
  console.error("Please provide a file");
  Deno.exit(1);
}

const fullPath = path.join(Deno.cwd(), file);
const source = await Deno.readTextFile(fullPath);
const blissfile = parseFunctions(astSource(source));

if (help) {
  console.log(getHelp(blissfile));
  Deno.exit(1);
}

const bs = blissfile.map((fn): FunctionDef & { caller: string[] } => {
  return {
    ...fn,
    caller: fn.isDefault
      ? ["default", ...(fn.name ? [fn.name] : [])]
      : fn.name
      ? [fn.name]
      : [],
  };
});

if (help) {
  console.log(help(blissfile));
}

const mod = await import(fullPath);

let caller = _.shift();
if (!caller) caller = "default";

if (typeof caller !== "string") {
  console.error("caller must be a string");
  Deno.exit(1);
}

const bsMatch = bs.find((fn) => fn.caller.includes(caller));

if (!bsMatch) {
  throw new Error(`Command ${caller} not found`);
}

if (bsMatch.isDefault) {
  mod.default(...spreadable(bsMatch, argsObj));
} else {
  mod[caller](...spreadable(bsMatch, argsObj));
}
