const fs = require("fs");
const path = require("path");

const outputDir = path.join(process.cwd(), "dist-web");
const indexPath = path.join(outputDir, "index.html");

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
}

fs.writeFileSync(path.join(outputDir, ".nojekyll"), "");
