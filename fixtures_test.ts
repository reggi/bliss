import * as fixtures from "./fixtures.ts";
import { parseFunctions } from "./parse_functions.ts";
import { createAstFromSource } from "./test_source.ts";
import { assertEquals } from "https://deno.land/std@0.223.0/assert/assert_equals.ts";

const fixutreArray = Object.entries(fixtures).map(([_, v]) => v);

fixutreArray.slice(0, 2).forEach(({ comment, source, expected }, index) => {
  Deno.test(comment, () => {
    const ast = createAstFromSource(source);

    const results = parseFunctions(ast);

    assertEquals(
      results,
      expected,
      [
        "",
        `Here is the source code:`,
        source,
        `This should pass the test with expected results`,
      ].join("\n")
    );
  });
});
