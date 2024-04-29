import { parse } from "https://deno.land/std@0.223.0/yaml/mod.ts";

const rawfixture = await Deno.readTextFile("./fixtures.yml");
export const fixtures = parse(rawfixture) as {
  comment: string;
  input: string;
  output: any;
}[];
