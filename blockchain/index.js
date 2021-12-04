/**
 * Copyright (c) 2021 BlockchainLAB
 *
 * License: GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007
 * https://www.gnu.org/licenses/agpl-3.0.en.html 
 * 
 * @author Enrico Zanardo <ezanardo@onezerobinary.com>
 *
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// load the .env
require("dotenv").config();
const lisk_sdk_1 = require("lisk-sdk");
const ipfs_api_1 = require("./ipfs-api");
const ipfs_module_1 = require("./ipfs-module");
// Update genesis block accounts to include the hello attribute
lisk_sdk_1.genesisBlockDevnet.header.timestamp = 1605699440;
lisk_sdk_1.genesisBlockDevnet.header.asset.accounts = lisk_sdk_1.genesisBlockDevnet.header.asset.accounts.map((a) => lisk_sdk_1.utils.objects.mergeDeep({}, a, {
    ipfs: {
        assets: [],
    },
}));
const f = {peers: []};
const forging = process.env.IS_FORGING_NODE === "true";
if (!forging && process.env.FORGING_NODE_IP) {
	f.peers.push({
		ip: process.env.FORGING_NODE_IP,
		port: parseInt(process.env.FORGING_NODE_PORT) || 5000
	})
}
const customConfig = {
    label: "concert",
    genesisConfig: {
        blockTime: 20,
        communityIdentifier: "concert",
    },
    rpc: {
        enable: true,
        mode: "ws",
        port: parseInt(process.env.WS_API_PORT) || 3003,
	host: "0.0.0.0"
    },
    logger: {
        consoleLogLevel: "info", // debug | info
    },
    network : {
        port: 5000,
        seedPeers: [
          ],
        fixedPeers: f.peers
    },
};
lisk_sdk_1.configDevnet.forging.force=forging;
async function main() {
    const appConfig = lisk_sdk_1.utils.objects.mergeDeep({}, lisk_sdk_1.configDevnet, customConfig);
    const app = lisk_sdk_1.Application.defaultApplication(lisk_sdk_1.genesisBlockDevnet, appConfig);
    app.registerModule(ipfs_module_1.IpfsModule);
    app.registerPlugin(ipfs_api_1.IpfsApiPlugin);
    app
        .run()
        .then(() => app.logger.info(`Chronostamp Blockchain started...`))
        .catch(error => {
        console.error(`Faced error in the Chronostamp Blockchain ${error}`);
        process.exit(1);
    });
}
main();
