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
exports.createAsset = exports.fetchAsset = void 0;
const ipfs_core_1 = require("ipfs-core");
const services_1 = require("../services");
async function fetchAsset(req, res) {
    try {
        const id = req.params.id;
        if (!id || !ipfs_core_1.isIPFS.cid(id)) {
            res.status(400).send(`Invalid CID specified`);
        }
        else {
            const node = await (0, services_1.getIpfsNode)();
            const data = await (0, services_1.fetchIpfsAsset)(node, id);
            res.status(200).send(data);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send(`It was not possible to fetch the Asset`);
    }
}
exports.fetchAsset = fetchAsset;
async function createAsset(req, res) {
    try {
        const data = req.file;
        if (!data) {
            res.status(400).send(`No file uploaded.`);
        }
        else {
            const node = await (0, services_1.getIpfsNode)();
            const ipfsAsset = await (0, services_1.addIpfsAsset)(node, data.buffer);
            res.status(201).send(ipfsAsset);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send(`It was not possible to create the Asset`);
    }
}
exports.createAsset = createAsset;
