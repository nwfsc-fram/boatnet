# Development Auth Server

Serves up JWT authentication requests with a temporary users JSON file. Meant to be used as proxy during Boatnet development.

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
