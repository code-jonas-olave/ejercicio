const md5 = require('md5');

const params = require('./params.js');

// Generación de firma digital:
const timestamp = Date.now() / 1000 | 0;

const hashMd5 = md5(params.application + params.secretKey + timestamp);
const hashBase64 = new Buffer(hashMd5, 'hex').toString('base64');

exports.timestamp = timestamp;
exports.hashBase64 = hashBase64;