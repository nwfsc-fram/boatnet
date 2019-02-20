# DevAuthProxy

A temporary auth server for use with developing boatnet apps without connecting to a live auth server.

(Note that temp-cert.pem and temp-*-key.pem are just temporary certificates/keys and are NOT intended for any production use!)

If you want to generate your own temporary keys for dev use,
```
openssl genrsa -out temp-priv-key.pem 2048
openssl rsa -in temp-priv-key.pem -pubout > temp-pub-key.pem
openssl req -new -x509 -key temp-priv-key.pem -out temp-cert.pem -days 3650 -subj //CN=localhost
```

## Configuration file for Development Auth Proxy

* You will want a real CouchDB database configured for your development. You can use your local machine, a VM, a db on a dev server, etc...
  * Example: `http://localhost:5984/my-test-db`

* Copy `server/config/authProxyConfig.sample.json` to `server/config/authProxyConfig.json` (`authProxyConfig.json` is in `.gitignore`)

* Modify the file as desired. (Do not duplicate any actual credentials.)


## Running the Development Auth Proxy

Run `npm run server` for an HTTPS (self-signed) dev auth server running on port 9000.

## Basic Testing

POST the following raw JSON to: https://localhost:9000/api/login using a utility such as Postman.
```
{
  "username": "test",
  "password": "test"
}
```
* This will return a JWT response with roles.
* If you want to verify this manually, paste the encoded token into https://jwt.io along with the public cert. You should see Signature Verified.

## Client Configuration

To use this dev proxy, configure `proxy.json` on your client as required.
Refer to the `package.json` in the `observer/obs-electron` project as an example.

