#!/bin/bash
cd "$(dirname "$0")"
node pullNumbers.js
git add json
git commit -m 'Updated numbers'
GIT_SSH="./sshWrapper.sh" git push
