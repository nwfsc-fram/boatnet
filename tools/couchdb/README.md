## CouchDB Design Documents

To escape/unescape javascript code (to make CouchDB happy), I'm using this for now:
* https://www.freeformatter.com/javascript-escape.html
* https://www.freeformatter.com/json-escape.html

Note that `'` might be escaped as `\'` which CouchDB does not like, so you'll want to manually change those back to `'`
