import { FunctionDef } from "./types.ts";

export const spreadable = (
  fn: FunctionDef,
  argsObj: {
    [x: string]: any;
  }
) => {
  return fn.parameters.map((param) => {
    if (param.name) {
      const value = argsObj[param.name];

      if (typeof value === "undefined" && param.required) {
        throw new Error(`Missing required argument: ${param.name}`);
      }

      return value;
    } else {
      return Object.fromEntries(
        Object.entries(param.type || {}).map(([key, { required }]) => {
          const value = argsObj[key];
          if (typeof value === "undefined" && required) {
            throw new Error(`Missing required argument: ${key}`);
          }

          return [key, value];
        })
      );
    }
  });
};

// import { parseArgs } from "https://deno.land/std@0.223.0/cli/parse_args.ts";
// import { fixtures } from "./fixtures.ts";
// import { FunctionDef } from "./types.ts";
// console.log(help(fixtures[0].output));
// console.log(help(fixtures[1].output));
// console.log(help(fixtures[2].output));
// console.log(help(fixtures[3].output));
// console.log(help(fixtures[4].output));
// console.log(help(fixtures[5].output));
// console.log(help(fixtures[6].output));
// console.log(help(fixtures[7].output));
// console.log(help(fixtures[8].output));
// console.log(help(fixtures[9].output));
// console.log(help(fixtures[10].output));
// console.log(help(fixtures[11].output));
// console.log(help(fixtures[12].output));
// console.log(help());

// const { _, help, ...argsObj } = parseArgs(Deno.args);
// console.log({ argsObj });
// console.log(spreadable("numberOne", false, fixtures[13].output, argsObj));
