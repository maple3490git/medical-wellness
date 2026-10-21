"use strict";

const { app, BrowserWindow, shell, ipcMain } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function resolveOutDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "static-app", "out");
  }
  return path.join(__dirname, "..", "out");
}

function resolveSafe(outDir, candidate) {
  const resolved = path.resolve(candidate);
  const base = path.resolve(outDir);
  if (resolved === base || resolved.startsWith(base + path.sep)) {
    return resolved;
  }
  return null;
}

function serve(outDir, req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Méthode non autorisée");
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  } catch {
    res.writeHead(400);
    return res.end("Bad request");
  }

  const clean = pathname.replace(/\/+$/, "") || "/";
  const candidates = [];
  if (clean === "/") {
    candidates.push(path.join(outDir, "index.html"));
  } else if (clean.endsWith(".txt")) {
    const base = clean.slice(0, -".txt".length);
    candidates.push(path.join(outDir, clean));
    candidates.push(path.join(outDir, base, "index.txt"));
  } else if (clean.endsWith(".html")) {
    const base = clean.slice(0, -".html".length);
    candidates.push(path.join(outDir, clean));
    candidates.push(path.join(outDir, base, "index.html"));
  } else if (path.extname(clean)) {
    candidates.push(path.join(outDir, clean));
  } else {
    candidates.push(path.join(outDir, clean, "index.html"));
    candidates.push(path.join(outDir, clean + ".html"));
    candidates.push(path.join(outDir, clean, "index.txt"));
    candidates.push(path.join(outDir, clean + ".txt"));
  }

  for (const c of candidates) {
    const resolved = resolveSafe(outDir, c);
    if (!resolved) continue;
    let stat = null;
    try {
      stat = fs.statSync(resolved);
    } catch {
      continue;
    }
    if (stat.isFile()) {
      const ext = path.extname(resolved).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      if (req.method === "HEAD") return res.end();
      return res.end(fs.readFileSync(resolved));
    }
  }

  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  try {
    res.end(fs.readFileSync(path.join(outDir, "404.html")));
  } catch {
    res.end("<h1>404</h1>");
  }
}

function registerIpcHandlers() {
  ipcMain.handle("db:isAvailable", async () => db.isAvailable());
  ipcMain.handle("db:patients:list", async () => db.patients.list());
  ipcMain.handle("db:patients:get", async (_e, id) => db.patients.get(id));
  ipcMain.handle("db:patients:create", async (_e, data) => db.patients.create(data));
  ipcMain.handle("db:patients:update", async (_e, id, patch) => db.patients.update(id, patch));
  ipcMain.handle("db:patients:remove", async (_e, id) => db.patients.remove(id));
  ipcMain.handle("db:patients:count", async () => db.patients.count());
}

function createApp() {
  registerIpcHandlers();
  db.init().catch(() => {});
  const outDir = resolveOutDir();
  const server = http.createServer((req, res) => serve(outDir, req, res));

  let port = 0;
  server.on("error", (err) => {
    console.error("Serveur local : erreur", err);
  });

  server.listen(0, "127.0.0.1", () => {
    port = server.address().port;
    console.log(`Application servie sur http://127.0.0.1:${port}`);
    openWindow(port);
  });

  app.on("window-all-closed", () => {
    server.close();
    app.quit();
  });
}

function openWindow(port) {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: "#fdf8e8",
    title: "Medical Wellness — Administration",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost")) {
      return { action: "deny" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.loadURL(`http://127.0.0.1:${port}/`);

  const smokeTest = process.argv.includes("--smoke-test");
  if (smokeTest) {
    const logFile = path.join(app.getPath("temp"), "mw-smoke.log");
    const log = (msg) => fs.appendFileSync(logFile, msg + "\n");
    log("SMOKE-START " + new Date().toISOString());
    let done = false;
    win.webContents.on("did-fail-load", (_e, code, desc, url) => {
      log("did-fail-load code=" + code + " desc=" + desc + " url=" + url);
    });
    win.webContents.on("did-finish-load", async () => {
      if (done) return;
      done = true;
      try {
        const info = await win.webContents.executeJavaScript(
          "({ len: document.documentElement.outerHTML.length, doctype: (document.doctype && document.doctype.name) || '', title: document.title })"
        );
        log(`SMOKE-OK url=${win.webContents.getURL()} len=${info.len} doctype=${info.doctype} title=${info.title}`);
        if (info.len < 400 || info.doctype !== "html") {
          log("SMOKE-FAIL page semble vide");
          app.exit(1);
          return;
        }
        const routeChecks = await win.webContents.executeJavaScript(
          `Promise.all(${JSON.stringify(["/dashboard", "/patients", "/facturation", "/caisse", "/prestations", "/roles", "/patients/pat-001"])}.map(function (r) {
            return fetch(r + ".txt").then(function (res) {
              return res.text().then(function (body) { return r + ".txt=" + res.status + ":" + body.length; });
            });
          })).then(function (a) { return a.join(" | "); })`
        );
        log("ROUTE-CHECK " + routeChecks);
        setTimeout(() => app.quit(), 400);
      } catch (err) {
        log("SMOKE-FAIL erreur evaluation: " + (err && err.stack ? err.stack : err));
        app.exit(1);
      }
    });
    setTimeout(() => {
      if (!done) {
        log("SMOKE-FAIL timeout");
        app.exit(1);
      }
    }, 20000);
  }

  const navTest = process.argv.includes("--nav-test");
  if (navTest) {
    const logFile = path.join(app.getPath("temp"), "mw-nav.log");
    const log = (msg) => fs.appendFileSync(logFile, msg + "\n");
    log("NAV-TEST-START " + new Date().toISOString());
    win.webContents.on("console-message", (_e, level, message) => {
      if (level >= 2) log("CONSOLE[" + level + "] " + message);
    });
    win.webContents.on("did-navigate", (_e, url) => log("NAV(doc) " + url));
    win.webContents.on("did-navigate-in-page", (_e, url) => log("NAV(spa) " + url));
    win.webContents.on("did-fail-load", (_e, code, desc, url) => {
      log("FAIL " + code + " " + desc + " " + url);
    });
    let ran = false;
    win.webContents.on("did-finish-load", async () => {
      if (ran) return;
      ran = true;
      try {
        await new Promise((r) => setTimeout(r, 1800));
        const login = await win.webContents.executeJavaScript(`(async function () {
          var btns = Array.from(document.querySelectorAll("button"));
          var demo = btns.find(function (b) { return (b.textContent || "").trim() === "Admin"; });
          if (!demo) return "NO_DEMO path=" + location.pathname + " btns=" + btns.map(function (b) { return (b.textContent || "").trim(); }).filter(function (t) { return t; }).slice(-12).join(",");
          demo.click();
          return "demo-clicked";
        })()`);
        log("LOGIN " + login);
        await new Promise((r) => setTimeout(r, 3200));
        const nav = await win.webContents.executeJavaScript(`(async function () {
          var link = Array.from(document.querySelectorAll("a")).find(function (a) { var h = a.getAttribute("href") || ""; return h === "/roles" || h === "/roles/"; });
          if (!link) return "NO_LINK path=" + location.pathname + " links=" + Array.from(document.querySelectorAll("a")).map(function (a) { return a.getAttribute("href"); }).slice(0, 25).join(",");
          link.click();
          await new Promise(function (r) { setTimeout(r, 2600); });
          var txt = document.body.innerText || "";
          return "afterClick path=" + location.pathname + " is404=" + /404|not found|introuvable/i.test(txt) + " head=" + txt.slice(0, 140).replace(/\\n/g, " ");
        })()`);
        log("NAV " + nav);
        const fetchCheck = await win.webContents.executeJavaScript(
          `fetch("/roles.txt").then(function(r){return r.text().then(function(b){return "roles.txt=" + r.status + ":" + b.length;});})`
        );
        log("FETCH " + fetchCheck);
        setTimeout(() => app.quit(), 400);
      } catch (err) {
        log("ERR " + (err && err.stack ? err.stack : err));
        app.exit(1);
      }
    });
  }

  win.on("closed", () => {
    app.quit();
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const wins = BrowserWindow.getAllWindows();
    if (wins.length > 0) {
      if (wins[0].isMinimized()) wins[0].restore();
      wins[0].focus();
    }
  });

  app.whenReady().then(() => {
    createApp();
  });
}