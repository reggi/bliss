import { parseFunctions } from "./parse_functions.ts";
import { createAstFromSource } from "./test_source.ts";
import { parseArgs } from "https://deno.land/std@0.223.0/cli/parse_args.ts";
import path from "npm:path";
import { FunctionDef, ParamDef } from "./types.ts";
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
const blissfile = parseFunctions(createAstFromSource(source));

if (help) {
  console.log(getHelp(blissfile));
  Deno.exit(1);
}

const bs = blissfile.map((fn): FunctionDef & { caller?: string } => {
  return {
    ...fn,
    caller: fn.isDefault ? "default" : fn.name,
  };
});

if (help) {
  console.log(help(blissfile));
}

const mod = await import(fullPath);

let caller = _.shift();
if (!caller) caller = "default";

const bsMatch = bs.find((fn) => fn.caller === caller);

if (!bsMatch) {
  throw new Error(`Command ${caller} not found`);
}

mod[caller](...spreadable(bsMatch, argsObj));
