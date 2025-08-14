"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMongoClient = createMongoClient;
const mongodb_1 = require("mongodb");
async function createMongoClient(uri) {
    if (!uri)
        throw new Error('MONGODB_URI is required');
    const client = new mongodb_1.MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        retryReads: true,
        retryWrites: true,
    });
    await client.connect();
    return client;
}
//# sourceMappingURL=mongo.js.map