const ts = require('/root/.nvm/versions/node/v20.19.2/lib/node_modules/typescript');
const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (/\.tsx?$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function adjustImports(code) {
  return code.replace(/from ['"]((?:\.\.\/|\.\/)[^'"\n]+)['"]/g, (m, p) => {
    if (/\.[a-zA-Z]+$/.test(p)) return m;
    return `from '${p}.js'`;
  });
}

const files = getFiles('.');
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const result = ts.transpileModule(src, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      allowJs: true,
      esModuleInterop: true,
    },
    fileName: file,
  });
  const outPath = path.join('dist', file.replace(/\.(ts|tsx)$/, '.js'));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, adjustImports(result.outputText));
}
