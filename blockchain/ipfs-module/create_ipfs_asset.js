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
exports.CreateIpfsAsset = void 0;
const lisk_sdk_1 = require("lisk-sdk");
const schemas_1 = require("./schemas");
const uuid_1 = require("uuid");
class CreateIpfsAsset extends lisk_sdk_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = "createIpfsAsset";
        this.id = 0;
        this.schema = schemas_1.createIpfsAssetSchema;
    }
    validate({ asset }) {
        if (!(0, uuid_1.validate)(asset.id)) {
            throw new Error(`Invalid assetId provided ${asset.id} on the transaction.`);
        }
        if (!asset.cid || typeof asset.cid !== "string") {
            throw new Error(`Invalid "asset.cid" defined on transaction.`);
        }
        if (!asset.checksum || typeof asset.checksum !== "string" || asset.checksum.length !== 32) {
            throw new Error(`Invalid "asset.checksum" defined on transaction`);
        }
        if (!asset.name || typeof asset.name !== "string" || asset.name.length > 64) {
            throw new Error(`Invalid "asset.name" defined on transaction`);
        }
        if (!asset.type || typeof asset.type !== "string") {
            throw new Error(`Invalid "asset.type" defined on transaction.`);
        }
        if (typeof asset.private !== "boolean") {
            throw new Error(`Type of asset must be defined on transaction.`);
        }
        if (!asset.kind || typeof asset.kind !== "string") {
            throw new Error(`Invalid "asset.kind" defined on transaction.`);
        }
    }
    async apply(context) {
        const { transaction, stateStore, asset } = context;
        const min = process.env.MIN_FEE_CREATE_ASSET ? process.env.MIN_FEE_CREATE_ASSET : "100";
        const minFee = BigInt(lisk_sdk_1.transactions.convertLSKToBeddows(min));
        if (transaction.fee < minFee) {
            throw new Error(`Fee is too low. Min Fee: ${min}`);
        }
        //  get the sender account
        const senderAddress = transaction.senderAddress;
        const senderAccount = await stateStore.account.get(senderAddress);
        // create ipfs asset id
        // const nonceBuffer = Buffer.alloc(8);
        // nonceBuffer.writeBigUInt64LE(transaction.nonce);
        // const seed = Buffer.concat([senderAddress, nonceBuffer]);
        // const id = cryptography.hash(seed).toString("hex");
        //  update the sender assets id list
        senderAccount.ipfs.assets.push(asset.id);
        stateStore.account.set(senderAccount.address, senderAccount);
        // create ipfs asset
        const base32UIAddress = lisk_sdk_1.cryptography.getBase32AddressFromAddress(senderAddress, "lsk");
        const ipfsAsset = {
            ...asset,
            owner: base32UIAddress,
        };
        // update the Asset List
        let listBuffer = await stateStore.chain.get(schemas_1.CHAIN_STATE_IPFS_ASSET_LIST);
        let list = listBuffer
            ? lisk_sdk_1.codec.decode(schemas_1.ipfsAssetListSchema, listBuffer)
            : { assetList: [] };
        // add to the list the new asset
        list.assetList.push(ipfsAsset);
        // encode the list to be used on the blockchain
        let encodedList = lisk_sdk_1.codec.encode(schemas_1.ipfsAssetListSchema, list);
        // update the blockchain state
        await stateStore.chain.set(schemas_1.CHAIN_STATE_IPFS_ASSET_LIST, encodedList);
    }
}
exports.CreateIpfsAsset = CreateIpfsAsset;
