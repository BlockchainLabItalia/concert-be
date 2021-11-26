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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionAssetSchema = exports.decodeTransaction = exports.saveTransactions = exports.getAllTransactions = exports.getDBInstance = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_extra = __importStar(require("fs-extra"));
const lisk_sdk_1 = require("lisk-sdk");
// load the .env
require("dotenv").config();
const CHRONOSTAMP_DB_PATH = process.env.CHRONOSTAMP_DB_PATH
    ? process.env.CHRONOSTAMP_DB_PATH
    : "~/.lisk/chronostamp/";
const CHRONOSTAMP_DB_NAME = process.env.CHRONOSTAMP_DB_NAME
    ? process.env.CHRONOSTAMP_DB_NAME
    : "chronostamp_plugin.db";
const DB_KEY_TRANSACTIONS = `ipfs:transactions`;
// Schema
const encodedTransactionSchema = {
    $id: "ipfs/encoded/transactions",
    type: "object",
    required: ["transactions"],
    properties: {
        transactions: {
            type: "array",
            fieldNumber: 1,
            items: {
                type: "object",
                properties: {
                    tx: {
                        fieldNumber: 1,
                        dataType: "bytes",
                    },
                    height: {
                        fieldNumber: 2,
                        dataType: "uint32",
                    },
                },
            },
        },
    },
};
// Define the DB instance
async function getDBInstance() {
    const dirPath = path_1.default.join(CHRONOSTAMP_DB_PATH.replace("~", os_1.default.homedir()), "plugins/data", CHRONOSTAMP_DB_NAME);
    await fs_extra.ensureDir(dirPath);
    return new lisk_sdk_1.db.KVStore(dirPath);
}
exports.getDBInstance = getDBInstance;
async function getTransactions(db) {
    try {
        const encodedTransactions = await db.get(DB_KEY_TRANSACTIONS);
        const { transactions } = lisk_sdk_1.codec.decode(encodedTransactionSchema, encodedTransactions);
        return transactions;
    }
    catch (error) {
        return [];
    }
}
async function getAllTransactions(db, registeredSchema) {
    const savedTransactions = await getTransactions(db);
    const transactions = [];
    for (const trx of savedTransactions) {
        const decoded = decodeTransaction(trx.tx, registeredSchema);
        transactions.push({ tx: decoded, height: trx.height });
    }
    return transactions;
}
exports.getAllTransactions = getAllTransactions;
async function saveTransactions(db, payload) {
    const savedTransactions = await getTransactions(db);
    const transactions = [...savedTransactions, ...payload];
    const encodedTransactions = lisk_sdk_1.codec.encode(encodedTransactionSchema, { transactions });
    await db.put(DB_KEY_TRANSACTIONS, encodedTransactions);
}
exports.saveTransactions = saveTransactions;
function decodeTransaction(encodedTransaction, registeredSchema) {
    const transaction = lisk_sdk_1.codec.decode(registeredSchema.transaction, encodedTransaction);
    const assetSchema = getTransactionAssetSchema(transaction, registeredSchema);
    const asset = lisk_sdk_1.codec.decode(assetSchema, transaction.asset);
    const id = lisk_sdk_1.cryptography.hash(encodedTransaction);
    return {
        ...lisk_sdk_1.codec.toJSON(registeredSchema.transaction, transaction),
        asset: lisk_sdk_1.codec.toJSON(assetSchema, asset),
        id: id.toString("hex"),
    };
}
exports.decodeTransaction = decodeTransaction;
function getTransactionAssetSchema(transaction, registeredSchema) {
    const txAssetSchema = registeredSchema.transactionsAssets.find(assetSchema => assetSchema.moduleID === transaction.moduleID && assetSchema.assetID === transaction.assetID);
    if (!txAssetSchema) {
        throw new Error(`ModuleID: ${transaction.moduleID} AssetID: ${transaction.assetID} is not registered.`);
    }
    return txAssetSchema.schema;
}
exports.getTransactionAssetSchema = getTransactionAssetSchema;
