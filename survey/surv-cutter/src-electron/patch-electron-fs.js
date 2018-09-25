// Fixes https://github.com/angular/angular-cli/issues/10681
// TODO: Remove this when build-angular is fixed (webpack issue)

const fs = require('fs');
// const f =
//   'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

const f = [
  'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js',
  // 'node_modules/better-sqlite3/lib/util.js',
  // 'node_modules/better-sqlite3/lib/database.js',
  // 'node_modules/bindings/bindings.js',
]

f.forEach(element => {
  fs.readFile(element, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(
      /node: false/g,
      "node: {crypto: true, fs: 'empty', stream: true}"
    );

    fs.writeFile(element, result, 'utf8', function(err) {
      if (err) return console.log(err);
    });
  });
});
