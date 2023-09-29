// edit dev.html and run this script to output prod.html

const { resolve } = require('path');
const { readdir, readFile, writeFile } = require('fs/promises');
const { execSync } = require('child_process');

const main = async () => {
  const dir = resolve(__dirname, 'templates');
  const templates = await readdir(dir);
  for (const templateName of templates) {
    const devPath = resolve(dir, templateName, 'dev.html');
    const prodPath = resolve(dir, templateName, 'prod.html');
    execSync(`npx mailwind --input-html ${devPath} --output-html ${prodPath}`, {
      cwd: process.cwd(),
    });

    // remove the script tag
    const prodHtml = await readFile(prodPath, 'utf8');
    const prodHtmlWithoutScript = prodHtml.replace(/<script.*<\/script>/, '');

    // compress html
    const prodHtmlCompressed = prodHtmlWithoutScript.replace(/\s+/g, ' ');

    await writeFile(prodPath, prodHtmlCompressed);

    console.log(`Generated ${prodPath}`);
  }
};

main()
  .then(() => {
    console.log('done');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
