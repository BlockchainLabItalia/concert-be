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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = exports.logger = exports.upload = exports.limiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const multer_1 = __importDefault(require("multer"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = __importDefault(require("../config"));
const { limiter: { max, windowMs }, } = config_1.default;
//set request limits
exports.limiter = (0, express_rate_limit_1.default)({
    windowMs,
    max,
    message: {
        status: 429,
        message: "Too many requests, please try again later.",
    },
});
// Manage file uploads
exports.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.logger = (0, morgan_1.default)("common");
const cors = (req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, `*`);
    res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-Width, Content-Type, Accept`);
    next();
};
exports.cors = cors;
