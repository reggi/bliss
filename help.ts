import { FunctionDef, ParamDef } from "./types.ts";

const tabularLogger = (input: string[][]): string => {
  if (input.length === 0) return "";

  // Calculate the maximum length of strings in each column
  const columnLengths = input[0].map((_, i) =>
    Math.max(...input.map((row) => row[i].length))
  );

  // Pad each cell in the row with spaces to match the max column length
  const paddedRows = input.map((row) =>
    row.map((cell, i) => cell.padEnd(columnLengths[i], " "))
  );

  // Join the padded cells and separate rows by new lines
  return paddedRows.map((row) => `  ${row.join("  ")}`).join("\n");
};

const opt = (strings: TemplateStringsArray, ...values: any[]) => {
  if (values.some((value) => typeof value !== "string")) {
    return "";
  }
  return strings.reduce(
    (result, str, i) => result + str + (values[i] || ""),
    ""
  );
};

function handleParam(param: ParamDef, parentName?: string): any {
  let { name, type, tags, required } = param;

  if (!type) type = "unknown";
  if (typeof type === "string") {
    if (tags?.inputType) type = tags.inputType;
    return [
      parentName ? opt`--${parentName}.${name}` : opt`--${name}`,
      required ? opt`<${type}>` : opt`[${type}]`,
      opt`${tags?.desc}`,
    ];
  }
  return Object.entries(type).map(([name, { type, required }]) => {
    const item = { name, type, tags, required };
    return handleParam(
      item,
      [parentName, param.name].filter((v) => v).join(".")
    );
  });
}

export const help = (bf: FunctionDef[]) => {
  const defaultFn = bf.find((fn) => fn.isDefault);
  const withoutDefault = bf.filter((fn) => !fn.isDefault);
  bf = defaultFn ? [defaultFn, ...withoutDefault] : bf;
  const flags = bf
    .map((fn, index) => {
      let { isDefault, name, parameters, tags } = fn;
      const params = parameters || [];
      const p = params.map((param) => handleParam(param).flat());

      name = opt`${name}`;
      if (name && isDefault) name = opt`[${name}]`;
      if (!name) name = `<default>`;

      const prepend = [name, `$${index}`];

      const flags = p.map((v, i) => {
        return ["", ...v];
      });

      const current = [prepend, ...flags];

      return current;
    })
    .flat();

  let current = tabularLogger(flags);

  bf.map((fn, index) => {
    current = current.replace(`$${index}`, fn.tags?.desc || "");
  });

  return current;
};

// import { fixtures } from "./fixtures.ts";
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
// console.log(help(fixtures[13].output));
