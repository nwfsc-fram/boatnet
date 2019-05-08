var mytransform = function(doc) {
  doc.speciesID = parseInt(doc.speciesID);
  doc.speciesCode = parseInt(doc.speciesCode);
  doc.active = !(doc.active === '0');
  return doc;
};

module.exports = mytransform;
