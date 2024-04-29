#!/usr/bin/env -S deno run -A /Users/thomasreggi/Desktop/bliss/blissparse/bin.ts

/** @desc Logs a and b */
export default function example(
  /**
   * @desc Variable A
   */
  a: string,
  /**
   * @desc Variable B
   */
  b: string
) {
  console.log({ a, b });
}
