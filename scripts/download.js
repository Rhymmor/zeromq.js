var child_process = require("child_process");
var https = require("https");
var fs = require("fs");
var url = require("url");
var os = require("os");

function download(fileUrl, filename, callback) {
  if (os.platform() === 'win32') {
    return downloadForWin(fileUrl, filename, callback);
  } else {
    child_process
      .spawn('curl', ['-L', '-o', filename, fileUrl], {stdio: 'inherit'})
      .on('close', function(code, signal) {
          callback(code === 0 ? undefined : 'Download failed');
      });
  }
}

function writeToFile(filename, response, callback) {
  response.pipe(fs.createWriteStream(filename));
  response.on("end", callback);
}

function downloadForWin(fileUrl, filename, callback) {
  https
    .get(fileUrl, function(response) {
      if (
        response.statusCode > 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        if (url.parse(response.headers.location).hostname) {
          https.get(response.headers.location, function(res) {
            writeToFile(filename, res, callback);
          });
        } else {
          https
            .get(
              url.resolve(
                url.parse(fileUrl).hostname,
                response.headers.location
              ),
              function(res) {
                writeToFile(filename, res, callback);
              }
            )
            .on("error", callback);
        }
      } else {
        writeToFile(filename, response, callback);
      }
    })
    .on("error", callback);
}

module.exports = {
  download: download
};
