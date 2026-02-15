import footnote from "markdown-it-footnote";
import { defineConfig } from "vitepress";
import path from "node:path";
import fs from "node:fs";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "你并不了解 JavaScript（社区版）",
  description:
    "你并不了解 JavaScript,你不知道的 JavaScript,第二版,中文版,社区版,免费版",
  lang: "zh-CN",
  srcDir: ".",
  base: "/",
  srcExclude: ["es-next-beyond/**/*", "sync-async/**/*"],
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      {
        text: "赞助",
        link: "https://github.com/liunnn1994/You-Dont-Know-JS-zh-CN#%E8%B5%9E%E5%8A%A9",
      },
    ],

    sidebar: [
      {
        text: "入门",
        link: "/get-started/README",
        items: [
          {
            text: "前言 (由 Brian Holt 撰写)",
            link: "/get-started/foreword",
          },
          { text: "序", link: "/preface" },
          {
            text: "第一章：什么是 JavaScript？",
            link: "/get-started/ch1",
          },
          { text: "第二章：JS 概观", link: "/get-started/ch2" },
          { text: "第三章：寻根究底", link: "/get-started/ch3" },
          { text: "第四章：大局观", link: "/get-started/ch4" },
          {
            text: "附录 A：欲穷千里目，更上一层楼",
            link: "/get-started/apA",
          },
          {
            text: "附录 B：温故而知新",
            link: "/get-started/apB",
          },
        ],
      },
      {
        text: "作用域与闭包",
        link: "/scope-closures/README",
        items: [
          {
            text: "前言 (由 Sarah Drasner 撰写)",
            link: "/scope-closures/foreword",
          },
          { text: "序", link: "/preface" },
          {
            text: "第一章：什么是作用域？",
            link: "/scope-closures/ch1",
          },
          {
            text: "第二章：图解作用域词法",
            link: "/scope-closures/ch2",
          },
          { text: "第三章：作用域链", link: "/scope-closures/ch3" },
          { text: "第四章：全局作用域", link: "/scope-closures/ch4" },
          {
            text: "第五章：（并不）神秘的变量生命周期",
            link: "/scope-closures/ch5",
          },
          {
            text: "第六章：限制作用域的过度暴露",
            link: "/scope-closures/ch6",
          },
          { text: "第七章：闭包的使用", link: "/scope-closures/ch7" },
          { text: "第八章：模块化模式", link: "/scope-closures/ch8" },
          {
            text: "附录 A：欲穷千里目，更上一层楼",
            link: "/scope-closures/apA",
          },
          {
            text: "附录 B：练习",
            link: "/scope-closures/apB",
          },
        ],
      },
      {
        text: "对象与类",
        link: "/objects-classes/README",
        items: [
          {
            text: "前言 (由 Rick Waldron 撰写)",
            link: "/objects-classes/foreword",
          },
          { text: "第一章：对象基础", link: "/objects-classes/ch1" },
          { text: "第二章：对象是如何工作的", link: "/objects-classes/ch2" },
          { text: "第三章：类风格的对象", link: "/objects-classes/ch3" },
          { text: "第四章：this 的工作原理", link: "/objects-classes/ch4" },
          { text: "第五章：委托", link: "/objects-classes/ch5" },
          { text: "致谢！", link: "/objects-classes/thanks" },
        ],
      },
      {
        text: "类型与语法",
        link: "/types-grammar/README",
        items: [
          { text: "第一章：原始值", link: "/types-grammar/ch1" },
          { text: "第二章：原始类型的行为", link: "/types-grammar/ch2" },
          { text: "第三章：对象值", link: "/types-grammar/ch3" },
          { text: "第四章：强制类型转换", link: "/types-grammar/ch4" },
          { text: "致谢！", link: "/types-grammar/thanks" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/liunnn1994/You-Dont-Know-JS-zh-CN",
      },
    ],
    editLink: {
      pattern:
        "https://github.com/liunnn1994/You-Dont-Know-JS-zh-CN/edit/2ed-zh-CN/:path",
      text: "在 GitHub 上编辑",
    },
    footer: {
      message: `此作品是根据<a target="_blank" style="color: var(--vp-c-brand)" href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh">署名-非商业性使用-禁止演绎 4.0 国际</a>授权。`,
      copyright: `© 2019-2025 <a target="_blank" style="color: var(--vp-c-brand)" href="https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed#license--copyright">Kyle Simpson 版权所有</a>。`,
    },
  },
  markdown: {
    config: (md) => {
      md.use(footnote);
    },
  },
  vite: {
    plugins: [
      {
        name: "resolve-path-by-current-md",
        resolveId(id, importer) {
          // 1. 排除非Markdown引入的场景、无引入源、绝对路径/远程路径/npm包
          if (
            !importer ||
            !importer.endsWith(".md") ||
            /^(https?:\/\/|@)/.test(id) ||
            path.isAbsolute(id)
          ) {
            return null; // 走默认解析逻辑
          }

          // 2. 匹配规则：无 ./、../、/ 开头的路径
          const isNoPrefix = !/^(?:\.\/|\.\.\/|\/)/.test(id);
          if (isNoPrefix) {
            // 3. 获取当前Markdown文件的目录路径（关键：基于importer）
            const currentMdDir = path.dirname(importer);
            // 4. 拼接：当前MD目录 + 目标资源路径
            const resolvedPath = path.resolve(currentMdDir, id);

            // 5. 验证文件是否存在（可选，增强鲁棒性）
            if (fs.existsSync(resolvedPath)) {
              return { id: resolvedPath }; // 返回真实路径，让Vite解析
            }
          }

          return null; // 其他情况走默认逻辑
        },
      },
    ],
  },
});
