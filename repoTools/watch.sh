#!/bin/bash
npx nodemon --exec "ts-node $1" --watch $1 "${@:2}"