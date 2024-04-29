import { parseArgs } from "https://deno.land/std@0.223.0/cli/parse_args.ts";

const args = parseArgs(Deno.args);

console.log(args);
