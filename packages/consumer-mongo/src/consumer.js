"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeMongoClient = initializeMongoClient;
var dotenv = __importStar(require("dotenv"));
var kafkajs_1 = require("kafkajs");
var mongodb_1 = require("mongodb");
var crypto_1 = __importDefault(require("crypto"));
var sdk_1 = require("@tributary-so/sdk");
var web3_js_1 = require("@solana/web3.js");
var anchor = __importStar(require("@coral-xyz/anchor"));
dotenv.config();
// change groupId each time you run to be able to read all messages
var groupId = process.env.KAFKA_CONSUMER_GROUP_NAME || "consumer-mongo";
var dbName = "db";
var sdk = new sdk_1.RecurringPaymentsSDK(new web3_js_1.Connection(process.env.SOLANA_API), new anchor.Wallet(web3_js_1.Keypair.generate()));
function initializeKafka() {
    var bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS;
    if (!bootstrapServers) {
        throw new Error("KAFKA_BOOTSTRAP_SERVERS in .env are not defined");
    }
    var kafka = new kafkajs_1.Kafka({
        clientId: "consumer-mongo",
        brokers: bootstrapServers.split(","),
    });
    return kafka;
}
function initializeConsumer() {
    var kafka = initializeKafka();
    var consumer = kafka.consumer({
        groupId: groupId,
    });
    return consumer;
}
function initializeMongoClient() {
    var mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
        throw new Error("MONGODB_URI in .env are not defined");
    }
    var client = new mongodb_1.MongoClient(mongoUrl);
    return client;
}
function getTopics() {
    var topics = sdk.program.idl.events.map(function (event) { return "tributary_" + event.name; });
    topics.push("tributary_transactions");
    return topics;
}
function storeTx(data) {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, collection, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.info("Storing transaction with signature: ".concat(data.signature));
                    client = initializeMongoClient();
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db(dbName);
                    collection = db.collection("transactions");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, 5, 7]);
                    return [4 /*yield*/, collection.insertOne(__assign(__assign({}, data), { _id: data.signature }))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 4:
                    e_1 = _a.sent();
                    if (e_1 instanceof mongodb_1.MongoError && e_1.code === 11000) {
                        // Silently skip duplicate key errors
                        return [2 /*return*/];
                    }
                    throw e_1; // Re-throw other errors
                case 5: return [4 /*yield*/, client.close()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function storeEvent(data) {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, collection, idString, hash, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = initializeMongoClient();
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db(dbName);
                    collection = db.collection("events");
                    console.info("Storing new event in signature ".concat(data.signature, ": ").concat(data.event_type, " @ ").concat(data.slot));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, 5, 7]);
                    idString = "".concat(data.signature, "_").concat(data.index, "_").concat(data.event_type);
                    hash = crypto_1.default.createHash("sha256").update(idString).digest("hex");
                    return [4 /*yield*/, collection.insertOne(__assign(__assign({}, data), { _id: hash }))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 4:
                    e_2 = _a.sent();
                    if (e_2 instanceof mongodb_1.MongoError && e_2.code === 11000) {
                        // Silently skip duplicate key errors
                        return [2 /*return*/];
                    }
                    throw e_2; // Re-throw other errors
                case 5: return [4 /*yield*/, client.close()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function runConsumer() {
    return __awaiter(this, void 0, void 0, function () {
        var consumer, topics, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    consumer = initializeConsumer();
                    topics = getTopics();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, consumer.connect()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, consumer.subscribe({ topics: topics, fromBeginning: true })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, consumer.run({
                            autoCommitInterval: 5000,
                            eachMessage: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                                var values;
                                var topic = _b.topic, partition = _b.partition, message = _b.message;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            values = message.value
                                                ? JSON.parse(message.value.toString())
                                                : "";
                                            if (!(topic === "tributary_transactions")) return [3 /*break*/, 2];
                                            return [4 /*yield*/, storeTx(values)];
                                        case 1:
                                            _c.sent();
                                            return [3 /*break*/, 4];
                                        case 2:
                                            values.event_type = topic;
                                            return [4 /*yield*/, storeEvent(values)];
                                        case 3:
                                            _c.sent();
                                            _c.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); },
                        })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
runConsumer().catch(function (error) {
    console.error(error);
    process.exit(1);
});
