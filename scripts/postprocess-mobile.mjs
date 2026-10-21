import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] || "android/app/src/main/assets/public";

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

let created = 0;
if (fs.existsSync(root)) {
  const files = [];
  walk(root, (f) => files.push(f));

  for (const file of files) {
    const rel = path.relative(root, file);
    const dir = path.dirname(file);
    if (rel.endsWith("index.html")) {
      const base = rel === "index.html" ? null : rel.slice(0, -"index.html".length);
      if (!base) continue;
      const target = path.join(root, base.replace(/[\\/]$/, "") + ".html");
      if (!fs.existsSync(target)) {
        fs.copyFileSync(file, target);
        created++;
      }
    } else if (rel.endsWith("index.txt")) {
      const base = rel === "index.txt" ? null : rel.slice(0, -"index.txt".length);
      if (!base) continue;
      const target = path.join(root, base.replace(/[\\/]$/, "") + ".txt");
      if (!fs.existsSync(target)) {
        fs.copyFileSync(file, target);
        created++;
      }
    }
    void dir;
  }
  console.log(`Post-traitement mobile : ${created} fichiers miroir crees dans ${root}`);
} else {
  console.error(`Dossier introuvable : ${root}`);
  process.exit(1);
}