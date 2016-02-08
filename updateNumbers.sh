#!/bin/bash
cd "$(dirname "$0")"
node pullNumbers.js
if ! git diff-index --quiet HEAD json; then
  git add json
  git commit -m 'Updated numbers'
  GIT_SSH="./sshWrapper.sh" git push
fi
