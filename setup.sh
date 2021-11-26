#!/bin/bash

#apt update

#apt install git wget curl make buil-essential

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash

nvm install 12.20.2

npm install pm2 -g

pm2 update

pm2 completion install

npm install

pm2 start pm2.conf.json

pm2 save