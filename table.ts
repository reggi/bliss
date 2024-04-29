const tabularLogger = (input: string[][]) => {
  const columnLengths = input[0].map((_, i) =>
    Math.max(...input.map((row) => row[i].length))
  );
  const paddedRows = input.map((row) =>
    row.map((cell, i) => cell.padEnd(columnLengths[i], " "))
  );
  return paddedRows.map((row) => `  ${row.join("  ")}`).join("\n");
};

const table = (strings: TemplateStringsArray, ...expressions: any[]) => {
  const rows = strings.reduce((result, string, i) => {
    return result
      .concat(
        string
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
      )
      .concat([expressions[i] ? [expressions[i].toString()] : []]);
  }, []);
  return tabularLogger(rows.filter((row) => row.length > 0));
};

// Usage
const name = "Alice";
const age = 30;
const output = table`
  Name    Age
  ${name}  ${age}
  Bob      25
`;

console.log(output);
