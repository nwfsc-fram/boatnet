declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
// https://github.com/quasarframework/vue-cli-plugin-quasar/issues/4
declare module 'quasar';
declare module 'vue-touch-keyboard';
declare module 'pouchdb-utils';
// https://stackoverflow.com/questions/50576746/import-pdfmake-js-file-to-my-ts-file
declare module 'pdfmake/build/pdfmake.js';
declare module 'pdfmake/build/vfs_fonts.js';

declare module 'querystring';