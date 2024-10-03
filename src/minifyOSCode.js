const fs = require("fs");
const UglifyJS = require("uglify-js");

const minifyOSCode = () => {
  const bootScript = fs.readFileSync("./public/os/system/boot.js", "utf8");
  const guiScript = fs.readFileSync("./public/os/system/gui.js", "utf8");
  const kernelScript = fs.readFileSync("./public/os/system/kernel.js", "utf8");

  const code = {
    "boot.js": bootScript,
    "gui.js": guiScript,
    "kernel.js": kernelScript,
  };

  const options = {
    keep_fargs: true, // Keep function arguments
    keep_fnames: true, // Preserve function names
    mangle: false,
    compress: false,   // Disable compression
    // ecma: "2015",
    // beautify: false,
};
  const minifiedResult = UglifyJS.minify(code, options);

  fs.writeFile("./public/min/system_min.js", minifiedResult.code, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("minified: " + JSON.stringify(Object.keys(code)));
}); 
};

module.exports.minifyOSCode = minifyOSCode;
