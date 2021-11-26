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
exports.ipfsAssetListSchema = exports.ipfsAccountSchema = exports.transferOwnershipIpfsAssetSchema = exports.createIpfsAssetSchema = exports.CHAIN_STATE_IPFS_ASSET_LIST = exports.CHAIN_STATE_IPFS_ASSET_COUNTER = void 0;
exports.CHAIN_STATE_IPFS_ASSET_COUNTER = "ipfs:assetCounter";
exports.CHAIN_STATE_IPFS_ASSET_LIST = "ipfs:assetList";
exports.createIpfsAssetSchema = {
    $id: "lisk/ipfs/createAsset",
    type: "object",
    required: [
        "id",
        "cid",
        "checksum",
        "name",
        "type",
        "customFields",
        "timestamp",
        "private",
        "kind",
    ],
    properties: {
        id: {
            dataType: "string",
            fieldNumber: 1,
        },
        cid: {
            dataType: "string",
            fieldNumber: 2,
        },
        checksum: {
            dataType: "string",
            fieldNumber: 3,
        },
        name: {
            dataType: "string",
            fieldNumber: 4,
        },
        type: {
            dataType: "string",
            fieldNumber: 5,
        },
        customFields: {
            dataType: "bytes",
            fieldNumber: 6,
        },
        timestamp: {
            dataType: "uint64",
            fieldNumber: 7,
        },
        private: {
            dataType: "boolean",
            fieldNumber: 8,
        },
        kind: {
            dataType: "string",
            fieldNumber: 9,
        },
    },
};
exports.transferOwnershipIpfsAssetSchema = {
    $id: "lisk/ipfs/transferOwnershipAsset",
    type: "object",
    required: ["id", "newCid", "newOwner", "timestamp"],
    properties: {
        id: {
            dataType: "string",
            fieldNumber: 1,
        },
        newCid: {
            dataType: "string",
            fieldNumber: 2,
        },
        newOwner: {
            dataType: "string",
            fieldNumber: 3,
        },
        timestamp: {
            dataType: "uint64",
            fieldNumber: 4,
        },
    },
};
exports.ipfsAccountSchema = {
    type: "object",
    properties: {
        assets: {
            fieldNumber: 1,
            type: "array",
            items: {
                dataType: "string",
            },
        },
    },
    default: {
        assets: [],
    },
};
exports.ipfsAssetListSchema = {
    $id: "lisk/ipfs/assetList",
    type: "object",
    required: ["assetList"],
    properties: {
        assetList: {
            type: "array",
            fieldNumber: 1,
            required: [
                "id",
                "cid",
                "checksum",
                "name",
                "type",
                "customFields",
                "owner",
                "private",
                "kind",
            ],
            items: {
                type: "object",
                properties: {
                    id: {
                        dataType: "string",
                        fieldNumber: 1,
                    },
                    cid: {
                        dataType: "string",
                        fieldNumber: 2,
                    },
                    checksum: {
                        dataType: "string",
                        fieldNumber: 3,
                    },
                    name: {
                        dataType: "string",
                        fieldNumber: 4,
                    },
                    type: {
                        dataType: "string",
                        fieldNumber: 5,
                    },
                    customFields: {
                        dataType: "bytes",
                        fieldNumber: 6,
                    },
                    owner: {
                        dataType: "string",
                        fieldNumber: 7,
                    },
                    private: {
                        dataType: "boolean",
                        fieldNumber: 8,
                    },
                    kind: {
                        dataType: "string",
                        fieldNumber: 9,
                    },
                },
            },
        },
    },
};
