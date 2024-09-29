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
    keep_fargs: true,
    keep_fnames: true,
    mangle: false,
  };
  const result = UglifyJS.minify(code, options);

  console.log(result.code);
};

module.exports.minifyOSCode = minifyOSCode;
