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
exports.getAssetById = exports.getAssetsByOwner = exports.getAllAssetsByKind = exports.getAllAssets = void 0;
// Invoke a command to the blockchain to retrieve all the ipfs assets
async function getAllAssets(channel) {
    try {
        const ipfsAssets = await channel.invoke(`ipfs:getAllAssets`);
        return ipfsAssets;
    }
    catch (err) {
        console.error(`It was not possible to get all assets. ${err}`);
        return [];
    }
}
exports.getAllAssets = getAllAssets;
async function getAllAssetsByKind(channel, { kind }) {
    try {
        const ipfsAssets = await channel.invoke(`ipfs:getAllAssets`);
        // filter the asset list based on the application
        const filteredList = ipfsAssets.filter(asset => asset.kind === kind);
        return filteredList;
    }
    catch (err) {
        console.error(`It was not possible to get all assets by kind ${err}`);
        return [];
    }
}
exports.getAllAssetsByKind = getAllAssetsByKind;
async function getAssetsByOwner(channel, { ownerId }) {
    try {
        // Get all ipfs assets from the blockchain
        const assets = await channel.invoke(`ipfs:getAllAssets`);
        // Filter the assets based on the ownerId
        const ownerAssets = assets.filter(asset => asset.owner === ownerId);
        return ownerAssets;
    }
    catch (err) {
        console.error(`It was not possible to get the assets of the owner. ${err}.`);
        return [];
    }
}
exports.getAssetsByOwner = getAssetsByOwner;
async function getAssetById(channel, { assetId }) {
    try {
        // Get all ipfs assets from the blockchain
        const assets = await channel.invoke(`ipfs:getAllAssets`);
        // Filter the ipfs assets based on the assetID
        const asset = assets.find(asset => asset.id === assetId);
        return asset;
    }
    catch (err) {
        console.error(`It was not possible to get assets by the provided ID. ${err}`);
        return [];
    }
}
exports.getAssetById = getAssetById;
