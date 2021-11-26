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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchIpfsAsset = exports.addIpfsAsset = exports.spawnNode = exports.getIpfsNode = void 0;
const ipfs_core_1 = __importDefault(require("ipfs-core"));
let ipfsNode;
async function getIpfsNode() {
    if (!ipfsNode) {
        await spawnNode();
    }
    return ipfsNode;
}
exports.getIpfsNode = getIpfsNode;
async function spawnNode() {
    ipfsNode = await ipfs_core_1.default.create({ silent: true });
}
exports.spawnNode = spawnNode;
// For router endpoints
async function addIpfsAsset(node, data) {
    return node.add(data);
}
exports.addIpfsAsset = addIpfsAsset;
async function fetchIpfsAsset(node, cid) {
    const content = [];
    const stream = node.get(cid);
    for await (const file of stream) {
        // @ts-ignore
        if (!file.content)
            continue;
        // @ts-ignore
        for await (const chunck of file.content) {
            content.push(chunck);
        }
    }
    return Buffer.concat(content);
}
exports.fetchIpfsAsset = fetchIpfsAsset;
