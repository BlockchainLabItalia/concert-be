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
exports.IpfsApiPlugin = void 0;
const express_1 = __importDefault(require("express"));
const lisk_framework_1 = require("lisk-framework");
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = __importDefault(require("./config"));
const middlewares = __importStar(require("./middlewares"));
const controllers = __importStar(require("./controllers"));
const services_1 = require("./services");
const lisk_sdk_1 = require("lisk-sdk");
const db_1 = require("./db");
const pJSON = require("../../package.json");
class IpfsApiPlugin extends lisk_framework_1.BasePlugin {
    static get alias() {
        return "ipfsApi";
    }
    static get info() {
        return {
            author: pJSON.author,
            version: pJSON.version,
            name: pJSON.name,
        };
    }
    get defaults() {
        return {};
    }
    get events() {
        return [];
    }
    get actions() {
        return {
            getAllAssets: () => controllers.getAllAssets(this._channel),
            getAllAssetsByKind: (params) => controllers.getAllAssetsByKind(this._channel, params),
            getAssetsByOwner: (params) => controllers.getAssetsByOwner(this._channel, params),
            getAssetById: (params) => controllers.getAssetById(this._channel, params),
            getTransactions: () => controllers.getTransactions(this._db, this.schemas, this._nodeInfo),
            getTransactionsBySenderPublicKey: (params) => controllers.getTransactionsBySenderPublicKey(this._db, this.schemas, this._nodeInfo, params === null || params === void 0 ? void 0 : params.publicKey),
            getHistoryOfAsset: (params) => controllers.getHistoryOfAsset(this._db, this.schemas, this._nodeInfo, params),
        };
    }
    async load(channel) {
        // Start Express
        this._app = (0, express_1.default)();
        this._channel = channel;
        this._db = await (0, db_1.getDBInstance)();
        this._nodeInfo = await this._channel.invoke("app:getNodeInfo");
        // Start ipfs node
        this._channel.once("app:ready", async () => {
            this._registerMiddlewares();
            this._registerControllers();
            await (0, services_1.spawnNode)();
            this._server = this._app.listen(config_1.default.app.port, "0.0.0.0");
            //listen to application events and enrich blockchain data for UI/third party application
            this._subscribeToChannel();
        });
    }
    async unload() {
        await new Promise((resolve, reject) => {
            this._server.close(err => {
                if (err) {
                    reject(`There was a problem when closing the server. ${err}`);
                    return;
                }
                resolve(undefined);
            });
        });
        // Close the custom DB
        await this._db.close();
    }
    _registerMiddlewares() {
        this._app.use(body_parser_1.default.json());
        this._app.use((0, helmet_1.default)());
        this._app.use(middlewares.limiter);
        this._app.use(middlewares.logger);
        this._app.use(middlewares.cors);
    }
    _registerControllers() {
        // IPFS file upload / fetch endpoints
        this._app.get("/api/ipfs/:id", controllers.fetchAsset);
        this._app.post("/api/ipfs", middlewares.upload.single("asset"), controllers.createAsset);
    }
    _subscribeToChannel() {
        // listen to application events and enrich blockchain data for UI/third party application
        this._channel.subscribe(`app:block:new`, async (eventInfo) => {
            const { block } = eventInfo;
            const { payload, header } = lisk_sdk_1.codec.decode(this.schemas.block, Buffer.from(block, "hex"));
            const blockHeader = lisk_sdk_1.codec.decode(this.schemas.blockHeader, header);
            if (payload.length > 0) {
                await (0, db_1.saveTransactions)(this._db, payload.map((tx) => ({ tx: tx, height: blockHeader.height })));
            }
        });
    }
}
exports.IpfsApiPlugin = IpfsApiPlugin;
