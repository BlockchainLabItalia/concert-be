#!/bin/bash
#
# NON LANCIARE QUESTO .sh MA ESEGUIRE MANUALMENTE UNA RIGA PER VOLTA
#
sudo apt-get update

sudo apt-get install -y git wget curl tar unzip zip ntp make build-essential

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

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
