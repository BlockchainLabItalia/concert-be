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
exports.IpfsModule = void 0;
const lisk_sdk_1 = require("lisk-sdk");
const create_ipfs_asset_1 = require("./create_ipfs_asset");
const schemas_1 = require("./schemas");
const transfer_ownership_ipfs_asset_1 = require("./transfer_ownership_ipfs_asset");
class IpfsModule extends lisk_sdk_1.BaseModule {
    constructor() {
        super(...arguments);
        this.name = "ipfs";
        this.id = 1000;
        this.accountSchema = schemas_1.ipfsAccountSchema;
        this.transactionAssets = [new create_ipfs_asset_1.CreateIpfsAsset(), new transfer_ownership_ipfs_asset_1.TransferOwnershipIpfsAsset()];
        this.actions = {
            amountOfAssets: async () => {
                // Get the bufferd value of the asset counter from the blockchain
                const assetCounterBuffer = await this._dataAccess.getChainState(schemas_1.CHAIN_STATE_IPFS_ASSET_LIST);
                // Decode the buffer into a number or set amount to 0
                const assentCounter = assetCounterBuffer
                    ? lisk_sdk_1.codec.decode(schemas_1.ipfsAssetListSchema, assetCounterBuffer).assetList.length
                    : 0;
                return assentCounter;
            },
            getAllAssets: async () => {
                // Get the buffered list of assets
                let bufferdAssetList = await this._dataAccess.getChainState(schemas_1.CHAIN_STATE_IPFS_ASSET_LIST);
                // Decode the buffered list of assets or []
                let listOfAssets = bufferdAssetList
                    ? lisk_sdk_1.codec.decode(schemas_1.ipfsAssetListSchema, bufferdAssetList).assetList
                    : [];
                // Return the asset list
                return listOfAssets;
            },
        };
    }
    async afterGenesisBlockApply(context) {
        const { stateStore } = context;
        // When the Blockchain starts set to default values for assetCounter and AssetList
        // 1. Set to [] the Asset list
        let bufferdAssetList = lisk_sdk_1.codec.encode(schemas_1.ipfsAssetListSchema, { assetList: [] });
        await stateStore.chain.set(schemas_1.CHAIN_STATE_IPFS_ASSET_LIST, bufferdAssetList);
    }
}
exports.IpfsModule = IpfsModule;
