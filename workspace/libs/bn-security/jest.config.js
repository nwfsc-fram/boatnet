module.exports = {
  name: 'bn-security',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/bn-security',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
