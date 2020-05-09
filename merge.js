const path = require('path');
const fs = require('fs');
const geojsonMerge = require('@mapbox/geojson-merge');

function fromDir(startPath, filter) {

  if (!fs.existsSync(startPath)) {
    return;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter); //recurse
    } else if (filename.indexOf(filter) >= 0) {
      geojsons.push(filename)
    };
  };
};

const geojsons = [];
const geojsonsParsed = [];

fromDir('data/', '.geojson');

let geojsonsProcessed = 0;

geojsons.forEach(function (geojsonFilename) {
  // console.log(geojsonFilename);
  fs.readFile(geojsonFilename, (err, data) => {
    let geojson = JSON.parse(data);
    // console.log(geojson.type);
    if (geojson.type === 'FeatureCollection') {
      for (var i = 0; i < geojson.features.length; i++) {
        geojson.features[i].properties.filename = geojsonFilename;
      }
    } else if (geojson.type === 'GeometryCollection') {
      for (var i = 0; i < geojson.geometries.length; i++) {
        geojson.geometries[i].properties ? geojson.geometries[i].properties.filename = geojsonFilename : geojson.geometries[i].properties = {filename: geojsonFilename};
        // geojson.geometries[i].properties.filename = geojsonFilename;
      }
    } else {
      if (geojson.properties) {
        geojson.properties.filename = geojsonFilename;
      } else {
        geojson.properties = {filename: geojsonFilename};
      }
    }

    geojsonsParsed.push(geojson);

    geojsonsProcessed++;
    if (geojsonsProcessed === geojsons.length - 1) {
      console.log('done');
      merge();
    }
  });
})

// var mergedGeoJSON = geojsonMerge.merge([
//   { type: 'Point', coordinates: [0, 1] },
//   { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 1] }, properties: {} }
// ]);

function merge() {
  const mergedGeoJSON = geojsonMerge.merge(geojsonsParsed);
  // console.log(JSON.stringify(mergedGeoJSON));
  saveFile('merged.geojson', JSON.stringify(mergedGeoJSON))
}

function saveFile(filename, data) {
  fs.writeFileSync(filename, data, (err) => {
    if (err) throw err;
    console.log('---> done.');
  });
}
