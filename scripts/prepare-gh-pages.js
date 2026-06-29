const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const outputDir = path.join(process.cwd(), "dist-web");
const indexPath = path.join(outputDir, "index.html");
const staticAssetDir = path.join(outputDir, "assets", "assets");

const staticAssets = [
  ["tuk-logo.png", "tuk-logo.eb6ac9385435cd4a3425640152c0e676.png"],
  ["tuk-symbol.png", "tuk-symbol.c196af7adb5fc12c22b08e9881a43851.png"],
  ["tuk-campus-map.png", "tuk-campus-map.05442ec7b18904b8c2ec086df5dc464d.png"],
  ["lunchbox-recommendation.png", "lunchbox-recommendation.174b6486f41f7aad192a9c23b8f7991f.png"],
  ["heart-empty.png", "heart-empty.35ec6d3935f7b9ee4d1f39721edecd2a.png"],
  ["heart-filled.png", "heart-filled.6fc32ec402be6aaa930e487e967b9850.png"],
];

let indexHtml = fs.readFileSync(indexPath, "utf8");
indexHtml = indexHtml
  .replaceAll('href="/favicon.ico"', 'href="./favicon.ico"')
  .replaceAll('src="/_expo/', 'src="./_expo/');
fs.writeFileSync(indexPath, indexHtml);

const jsDir = path.join(outputDir, "_expo", "static", "js", "web");
for (const fileName of fs.readdirSync(jsDir)) {
  if (!fileName.endsWith(".js")) {
    continue;
  }

  const jsPath = path.join(jsDir, fileName);
  const js = fs
    .readFileSync(jsPath, "utf8")
    .replaceAll('httpServerLocation:"/assets/', 'httpServerLocation:"assets/')
    .replaceAll('httpServerLocation:"./assets/', 'httpServerLocation:"assets/');
  fs.writeFileSync(jsPath, js);

  const fileHash = crypto.createHash("sha256").update(js).digest("hex").slice(0, 16);
  const cacheSafeFileName = fileName.replace(/-[a-f0-9]{32}\.js$/, `-${fileHash}.js`);
  if (cacheSafeFileName !== fileName) {
    const cacheSafePath = path.join(jsDir, cacheSafeFileName);
    fs.renameSync(jsPath, cacheSafePath);
    indexHtml = indexHtml.replaceAll(fileName, cacheSafeFileName);
  }
}

fs.writeFileSync(indexPath, indexHtml);

fs.mkdirSync(staticAssetDir, { recursive: true });
for (const [sourceName, outputName] of staticAssets) {
  fs.copyFileSync(path.join(process.cwd(), "assets", sourceName), path.join(staticAssetDir, outputName));
}

fs.writeFileSync(path.join(outputDir, ".nojekyll"), "");
