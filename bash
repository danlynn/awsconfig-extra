#!/usr/bin/env bash

# This shell script is useful for launching a bash shell which
# can be used to execute the various package.yml scripts (like:
# `npm run transpile`).

docker run --rm -it -v $(pwd):/myapp -w /myapp node:6.11.2 bash
