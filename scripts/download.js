var child_process = require("child_process");

function download(fileUrl, filename, callback) {
  child_process.spawn('curl', ['-L', '-o', filename, fileUrl], {stdio: 'inherit'})
      .on('close', function(code, signal) {
          callback(code === 0 ? undefined : 'Download failed');
      });
}

module.exports = {
  download: download
};
