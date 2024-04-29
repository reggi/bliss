import { parse } from "https://deno.land/std@0.223.0/yaml/mod.ts";
import { parseFunctions } from "./parse_functions.ts";
import { createAstFromSource } from "./test_source.ts";
import { assertEquals } from "https://deno.land/std@0.223.0/assert/assert_equals.ts";

const rawfixture = await Deno.readTextFile("./fixtures.yml");
const fixtures = parse(rawfixture) as {
  comment: string;
  input: string;
  output: any;
}[];

fixtures.slice(13, 14).forEach((fixture) => {
  Deno.test(fixture.comment, () => {
    const result = parseFunctions(createAstFromSource(fixture.input));
    // console.log(JSON.stringify(result, null, 2));
    assertEquals(result, fixture.output);
  });
});
