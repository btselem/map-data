const path = require('path');
const fs = require('fs');
const turf = require('@turf/turf');

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
// const geojsonsBounds = [];
const geojsonsBounds = {};

fromDir('data/', '.geojson');


let geojsonsProcessed = 0;

geojsons.forEach(function (geojson) {
  fs.readFile(geojson, (err, data) => {
    let bounds = turf.bbox(JSON.parse(data));
    // let boundsObj = {
    //   file: geojson,
    //   bounds: bounds,
    // }
    // geojsonsBounds.push(boundsObj);
    geojsonsBounds[geojson] = bounds;
    geojsonsProcessed++;
    if (geojsonsProcessed === geojsons.length - 1) {
      saveFile();
    }
  });
})

function saveFile() {
  fs.writeFileSync('bounds.json', JSON.stringify(geojsonsBounds), (err) => {
    if (err) throw err;
    console.log('---> done.');
  });
}
