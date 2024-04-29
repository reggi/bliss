#!/usr/bin/env -S deno run -A /Users/thomasreggi/Desktop/bliss/blissparse/bin.ts

/** @desc Logs the input */
export default function example(
  /**
   * @label Input
   * @desc The input to log
   */
  input: string,
  b: string
) {
  console.log({ input, b });
}

/** @desc Logs the xx Logs the xx Logs the xx Logs the xx Logs the xx */
export function fighter(
  /**
   * @label Input
   * @desc The input to log
   */
  input: string,
  b: string
) {
  console.log(`f${input} ${b}`);
}
