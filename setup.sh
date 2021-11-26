#!/bin/bash
apt update

apt install -y git wget curl make build-essential

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash

export NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install 12.20.2

npm install -g pm2

pm2 update

pm2 completion install

npm install

pm2 start pm2.conf.json

pm2 save