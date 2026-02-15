import { resolve, join, sep } from "node:path";
import {
  existsSync,
  readdirSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
} from "node:fs";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer";
import PDFMerger from "pdf-merger-js";
import { createRequire } from "node:module";
import generateAndSaveNewVersion from "./versions.mjs";

const pkgJson = createRequire(import.meta.url)("../package.json");
const htmlPath = resolve(process.cwd(), ".vitepress/dist");
const PREVIEW_PORT = "14173";
const FIRST_PAGE = "README.html";
const TOC_PAGE = "toc.html";
const olUrl = "https://zh-cn-ydk.js.org";
const localhost = "http://127.0.0.1";

const BOOK_DIRS = [
  "get-started",
  "scope-closures",
  "objects-classes",
  "types-grammar",
  "sync-async",
  "es-next-beyond",
]
  .map((dir) => join(htmlPath, dir))
  .filter(existsSync);

const numPattern = /\d+\.?\d*/;

const pdfStyle = readFileSync(
  resolve(process.cwd(), "scripts/pdf.css"),
  "utf-8",
);

async function main() {
  const version = await generateAndSaveNewVersion();
  const previewProcess = spawn("node", [
    resolve(process.cwd(), "./node_modules/vitepress/bin/vitepress.js"),
    "preview",
    "--port",
    PREVIEW_PORT,
  ]);
  await waitPreviewServer();
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  for (const dir of BOOK_DIRS) {
    const merger = new PDFMerger();
    const dirName = dir.split(sep).pop();
    console.log(`正在生成 ${dirName} 的 PDF 文件`);
    const fileList = readdirSync(dir);
    const chFiles = fileList
      .filter((file) => file.startsWith("ch"))
      .sort(
        (n1, n2) =>
          Number(n1.match(numPattern)[0]) - Number(n2.match(numPattern)[0]),
      );
    const apFiles = fileList
      .filter((file) => file.startsWith("ap"))
      .sort((str1, str2) => str1.localeCompare(str2));
    const files = [FIRST_PAGE, TOC_PAGE, ...chFiles, ...apFiles];

    for (const file of files) {
      console.log(`正在处理 ${file} 的 PDF buffer`);
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${PREVIEW_PORT}/${dirName}/${file}`, {
        waitUntil: "networkidle0",
      });
      await waitNextFrame(page);
      await page.evaluateHandle("document.fonts.ready");
      await page.evaluate(
        async ({ isFirstPage, pdfStyle, localhost, olUrl, version }) => {
          const pattern = /\s/g;
          const bookName = "你并不了解";
          const timeZone = "Asia/Shanghai";

          const titleDom = document.querySelector(`h1[id*="${bookName}"]`);
          if (isFirstPage) {
            [...document.querySelectorAll('a[href*=".html"]')].forEach((el) => {
              el.href = "#" + el.innerText.trim().replace(pattern, "-");
            });
            const blockquote = document.createElement("blockquote");
            const p = document.createElement("p");
            p.style.whiteSpace = "pre-line";
            p.innerText = `版本：v${version} 构建时间：${new Date().toLocaleString(
              "zh-CN",
              { timeZone },
            )} ${timeZone}\n最新版地址：https://github.com/liunnn1994/You-Dont-Know-JS-zh-CN/releases/latest`;
            blockquote.appendChild(p);
            titleDom.parentElement.insertBefore(
              blockquote,
              titleDom.nextSibling,
            );
          } else {
            titleDom?.remove();
          }

          [...document.querySelectorAll(`a[href*="${localhost}"]`)].forEach(
            (el) => {
              el.href = el.replace(localhost, olUrl);
            },
          );

          const range = document.createRange();
          const frag = range.createContextualFragment(
            `<style>${pdfStyle}</style>`,
          );
          document.querySelector("head").append(frag);
        },
        {
          isFirstPage: file === FIRST_PAGE,
          pdfStyle,
          localhost,
          olUrl,
          version,
        },
      );
      await waitNextFrame(page);
      const pdfBuf = await page.pdf({
        // 页面缩放比例
        scale: 1,
        // 是否展示页眉页脚
        displayHeaderFooter: false,
        // pdf存储单页大小
        format: "a4",
        // 开启渲染背景色，因为 puppeteer 是基于 chrome 浏览器的，浏览器为了打印节省油墨，默认是不导出背景图及背景色的
        printBackground: true,
      });
      await merger.add(pdfBuf);
      await page.close();
    }
    await merger.setMetadata({
      producer: pkgJson.author,
      author: "Kyle Simpson <getify@gmail.com> (https://github.com/getify)",
      translator: pkgJson.author,
      creator: pkgJson.author,
      title: "你并不了解 JavaScript（社区版）",
    });
    const mergedPdfBuffer = await merger.saveAsBuffer();
    const pdfDir = join(htmlPath, "pdf");
    if (!existsSync(pdfDir)) {
      mkdirSync(pdfDir);
    }
    writeFileSync(join(pdfDir, `${dirName}-v${version}.pdf`), mergedPdfBuffer);
  }

  await browser.close();
  previewProcess.kill("SIGKILL");
}

function waitPreviewServer() {
  return new Promise(async (resolve) => {
    while (true) {
      try {
        const res = await fetch(`http://localhost:${PREVIEW_PORT}`);
        if (res.ok) {
          resolve(true);
          break;
        }
      } catch (e) {}
      await sleep(1000);
    }
  });
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function waitNextFrame(page) {
  return page.evaluate(async () => {
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        // 模拟 networkidle0
        setTimeout(resolve, 500);
      });
    });
  });
}

main();
