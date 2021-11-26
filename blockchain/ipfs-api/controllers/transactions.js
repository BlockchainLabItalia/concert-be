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
exports.getHistoryOfAsset = exports.getTransactions = exports.getTransactionsBySenderPublicKey = exports.enrichTransaction = void 0;
const lisk_sdk_1 = require("lisk-sdk");
const db_1 = require("../db");
function enrichTransaction(transactions, nodeInfo) {
    return transactions.map(trx => {
        const module = nodeInfo.registeredModules.find(module => module.id === trx.tx.moduleID);
        if (!module) {
            throw new Error(`Is not possible to find the module.`);
        }
        const asset = module.transactionAssets.find(a => a.id === trx.tx.assetID);
        if (!asset) {
            throw new Error(`Can't find asset`);
        }
        return {
            ...trx.tx,
            height: trx.height,
            moduleName: module.name,
            assetName: asset.name,
        };
    });
}
exports.enrichTransaction = enrichTransaction;
async function getTransactionsBySenderPublicKey(db, schema, nodeInfo, publicKey) {
    try {
        const transactions = await (0, db_1.getAllTransactions)(db, schema);
        const filteredTransactions = transactions.filter(transaction => transaction.tx.senderPublicKey === publicKey);
        return enrichTransaction(filteredTransactions, nodeInfo);
    }
    catch (err) {
        console.error(`It was not possible to get the transactions for this public key: ${publicKey} . ${err}`);
        return [];
    }
}
exports.getTransactionsBySenderPublicKey = getTransactionsBySenderPublicKey;
async function getTransactions(db, schema, nodeInfo) {
    try {
        const transactions = await (0, db_1.getAllTransactions)(db, schema);
        return enrichTransaction(transactions, nodeInfo);
    }
    catch (err) {
        console.error(`It was not possible to get the transactions. ${err}`);
        return [];
    }
}
exports.getTransactions = getTransactions;
async function getHistoryOfAsset(db, schemas, nodeInfo, { assetId }) {
    try {
        const transactions = await (0, db_1.getAllTransactions)(db, schemas);
        const enrichedData = enrichTransaction(transactions, nodeInfo);
        const filteredData = enrichedData.filter(tx => tx.asset.id === assetId);
        const transformedData = filteredData.map(item => {
            const isTransfer = item.assetName === `transferIpfsAsset`;
            if (isTransfer) {
                return {
                    type: `transfer`,
                    owner: item.asset.newOwner,
                    cid: item.asset.newCid,
                    timestamp: item.asset.timestamp,
                };
            }
            return {
                type: `registration`,
                owner: lisk_sdk_1.cryptography.getBase32AddressFromPublicKey(Buffer.from(item.senderPublicKey, "hex")),
                cid: item.asset.cid,
                timestamp: item.asset.timestamp,
            };
        });
        return transformedData;
    }
    catch (err) {
        console.error(`It was not possible to get the History of asset. ${err}`);
        return [];
    }
}
exports.getHistoryOfAsset = getHistoryOfAsset;
