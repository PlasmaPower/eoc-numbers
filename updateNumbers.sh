#!/bin/bash
cd "$(dirname "$0")"
node pullNumbers.js
if ! git diff-index --quiet; then
  git add json
  git commit -m 'Updated numbers'
  GIT_SSH="ssh -i ./deploy-key" git push
fi
