import { assertEquals } from "https://deno.land/std@0.223.0/assert/assert_equals.ts";
import { parseFunctions } from "../parse_functions.ts";
import { astSource } from "../ast_source.ts";
import { fixtures } from "./fixtures.ts";

fixtures.slice(13, 14).forEach((fixture) => {
  Deno.test(fixture.comment, () => {
    const result = parseFunctions(astSource(fixture.input));
    // console.log(JSON.stringify(result, null, 2));
    assertEquals(result, fixture.output);
  });
});
