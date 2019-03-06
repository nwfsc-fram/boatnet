"use strict";
// Dev Auth Server - simulates an auth server
// For Boatnet app development use, without an actual auth endpoint.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// FRAM Data Team 2019
var express_1 = __importDefault(require("express"));
var https = __importStar(require("https"));
var bodyParser = __importStar(require("body-parser"));
var login_route_1 = require("./routes/login.route");
var pubkey_route_1 = require("./routes/pubkey.route");
var security_1 = require("./util/security");
var app = express_1.default();
var commandLineArgs = require('command-line-args');
var optionDefinitions = [{ name: 'secure', type: Boolean }];
var options = commandLineArgs(optionDefinitions);
app.use(bodyParser.json()); // for parsing application/json
// REST API
// Login
app.route('/api/login').post(login_route_1.login);
// Public Key (dev use only)
app.route('/api/pubkey').get(pubkey_route_1.pubkey);
if (options.secure) {
    var httpsServer_1 = https.createServer({
        // Temporary Keys, not secret and publically shared
        key: security_1.RSA_PRIVATE_KEY,
        cert: security_1.RSA_CERT
    }, app);
    // launch an HTTPS Server. Note: this does NOT mean that the application is secure
    httpsServer_1.listen(9000, function () {
        var address = httpsServer_1.address();
        console.log('HTTPS Secure Server running at https://localhost:' + address.port);
    });
}
else {
    // launch an HTTP Server
    var httpServer_1 = app.listen(3333, function () {
        var address = httpServer_1.address();
        console.log('HTTP Server running at http://localhost:' + address.port);
    });
}
