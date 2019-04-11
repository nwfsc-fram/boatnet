# Development Auth Server
# dev-auth-proxy

A dev-only auth server for use with developing boatnet apps without connecting to a live auth server.

### Getting Started
- Open the template config file located at:`server/config/authProxyConfig.sample.json`. We will use this when creating our actual config file. 
- Create an actual config file named: `server/config/authProxyConfig.json`. Here you can set the username and password to login, but do not duplicate any actual credentials. 
- You can set up your own CouchDB database configuration for development, then replace the dummy couch config with your server info, e.g.
```
"couchDBInfo": {
  "urlRoot": "http://localhost:5984",
  "readonlyDB": "my-fancy-db"
}
```
or for intranet dev,
```
"couchDBInfo": {
  "urlRoot": "https://nwcdevfram2.nwfsc2.noaa.gov:6984",
  "readonlyDB": "boatnet-dev-testing"
}
```
- Launch the auth server by navigating to apps/dev-auth-server directory and run `yarn serve`. This will start an HTTPS (self-signed) dev auth server running on port 9000. 

## Generating Your Own Self-Signed Certificates (Optional)
Note that bn-temp-cert.pem and temp-\*-key.pem are just temporary certificates/keys and are NOT intended for any production use!

If you want to generate your own temporary keys for dev use,

```
openssl genrsa -out temp-priv-key.pem 2048
openssl rsa -in temp-priv-key.pem -pubout > temp-pub-key.pem
openssl req -new -x509 -key temp-priv-key.pem -out temp-cert.pem -days 3650 -subj //CN=localhost
```

## Basic RESTful Testing

POST the following raw JSON to: https://localhost:9000/api/login using a utility such as Postman.

```
{
  "username": "test",
  "password": "test"
}
```

- This will return a JWT response with roles.
- If you want to verify this manually, paste the encoded token into https://jwt.io along with the public cert. You should see Signature Verified.

## Development Application Configuration

`obs-web` and `obs-wcgop-optecs` are configured to proxy automatically to this server, see `vue.config.js`

# Development Notes

Initial typescript project created like so, based on https://basarat.gitbooks.io/typescript/docs/quick/nodejs.html

```
mkdir dev-auth-server && cd dev-auth-server
npm init -y
npm install typescript --save-dev
npm install @types/node --save-dev
npx tsc --init --rootDir src --outDir lib --esModuleInterop --resolveJsonModule --lib es6,dom --module commonjs
# For live reload:
npm install ts-node --save-dev
npm install nodemon --save-dev
