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
exports.TransferOwnershipIpfsAsset = void 0;
const lisk_sdk_1 = require("lisk-sdk");
const uuid_1 = require("uuid");
const schemas_1 = require("./schemas");
class TransferOwnershipIpfsAsset extends lisk_sdk_1.BaseAsset {
    constructor() {
        super(...arguments);
        this.name = `transferIpfsAsset`;
        this.id = 1;
        this.schema = schemas_1.transferOwnershipIpfsAssetSchema;
    }
    validate({ asset }) {
        if (!(0, uuid_1.validate)(asset.id)) {
            throw new Error(`Invalid asset id ${asset.id} defined into the transaction.`);
        }
        if (!asset.newCid || typeof asset.newCid !== `string`) {
            throw new Error(`Invalid asset new CID ${asset.newCid} defined into the transaction.`);
        }
        if (!asset.newOwner || typeof asset.newOwner !== `string`) {
            throw new Error(`Invalid asset new Owner ${asset.newOwner} defined into the transaction.`);
        }
    }
    //
    async apply(context) {
        const { transaction, stateStore, asset } = context;
        const min = process.env.MIN_FEE_CHANGE_OWNERSHIP ? process.env.MIN_FEE_CHANGE_OWNERSHIP : "25";
        const minFee = BigInt(lisk_sdk_1.transactions.convertLSKToBeddows(min));
        if (transaction.fee < minFee) {
            throw new Error(`Fee is too low. Min Fee: ${min}`);
        }
        // get the sender
        const senderAddress = transaction.senderAddress;
        const senderAccount = await stateStore.account.get(senderAddress);
        // update sender
        senderAccount.ipfs.assets = senderAccount.ipfs.assets.filter(id => id !== asset.id);
        stateStore.account.set(senderAccount.address, senderAccount);
        // update the new owner of the asset
        // will throw an error when the account does not exist
        const newOwnerAccount = await stateStore.account.get(lisk_sdk_1.cryptography.getAddressFromBase32Address(asset.newOwner));
        newOwnerAccount.ipfs.assets.push(asset.id);
        stateStore.account.set(newOwnerAccount.address, newOwnerAccount);
        // get the asset list and ipfs asset
        const bufferedListAssets = await stateStore.chain.get(schemas_1.CHAIN_STATE_IPFS_ASSET_LIST);
        if (!bufferedListAssets) {
            throw new Error(`No assets founds`);
        }
        const listAssets = lisk_sdk_1.codec.decode(schemas_1.ipfsAssetListSchema, bufferedListAssets);
        const listAssetsIndex = listAssets.assetList.findIndex(storedAsset => storedAsset.id === asset.id);
        if (listAssetsIndex < 0) {
            throw new Error(`Asset not found`);
        }
        // check if the sender is the tho owner of the asset
        const senderBase32UIAddress = lisk_sdk_1.cryptography.getBase32AddressFromAddress(senderAddress, "lsk");
        if (listAssets.assetList[listAssetsIndex].owner !== senderBase32UIAddress) {
            throw new Error(`Sender does not own the asset`);
        }
        // check sender is not already owner
        if (asset.newOwner === senderBase32UIAddress) {
            throw new Error(`Sender is already owner of asset`);
        }
        // set new owner to the asset
        listAssets.assetList[listAssetsIndex].owner = asset.newOwner;
        listAssets.assetList[listAssetsIndex].cid = asset.newCid;
        // Update the state into the blockchain
        const bufferedAssetList = lisk_sdk_1.codec.encode(schemas_1.ipfsAssetListSchema, listAssets);
        await stateStore.chain.set(schemas_1.CHAIN_STATE_IPFS_ASSET_LIST, bufferedAssetList);
    }
}
exports.TransferOwnershipIpfsAsset = TransferOwnershipIpfsAsset;
