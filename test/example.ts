#!/usr/bin/env -S deno run -A jsr:@reggi/bliss@2.0.0-beta.0/bin

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
