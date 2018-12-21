# DevAuthProxy

A temporary auth server for use with developing boatnet apps without connecting to a live auth server.

(Note that temp-cert.pem and temp-key.pem are just temporary certificates and are not intended for actual application security.)

## Development server

Run `npm run server` for a dev auth server. 

## Client Configuration

To use this dev proxy, configure `proxy.json` on your client as required.
Refer to the `package.json` in the `observer/obs-electron` project as an example.

