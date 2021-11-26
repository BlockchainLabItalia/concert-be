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
function envToNumber(env) {
    if (!env) {
        return undefined;
    }
    return parseInt(env);
}
const config = {
    app: {
        port: envToNumber(process.env.IPFS_API_PORT) || 3001,
        name: process.env.npm_package_name,
        version: process.env.npm_package_version,
    },
    limiter: {
        max: envToNumber(process.env.IPFS_API_LIMITER_MAX) || 3,
        windowMs: envToNumber(process.env.IPFS_API_WINDOWS_MS) || 1000, // millisecond to wait
    },
};
exports.default = config;
