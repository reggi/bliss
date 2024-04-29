#!/bin/bash

run_tests() {
  output=$(NO_COLOR=true deno test -A ./fixtures_test.ts 2>&1)
  exit_code=$?

  output="here's a current failing test \n $output"

  # echo "$output" >>log.txt # Append the output to a log file

  if [ $exit_code -eq 0 ]; then
    break
  fi

  aider ./parse_functions.ts -m "$output"
}

while true; do
  run_tests
done

# run_tests
