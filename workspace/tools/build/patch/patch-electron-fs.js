// Fixes https://github.com/angular/angular-cli/issues/10681
// TODO: Remove this when build-angular is fixed (webpack issue)

const fs = require('fs');
const f =
  'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

fs.readFile(f, 'utf8', function(err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(
    /node: false/g,
    "node: {crypto: true, fs: 'empty', stream: true}"
  );

  fs.writeFile(f, result, 'utf8', function(err) {
    if (err) return console.log(err);
    console.log('browser.js patched successfully.');
  });
});
