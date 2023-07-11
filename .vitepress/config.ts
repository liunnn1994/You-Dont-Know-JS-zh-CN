import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "你并不了解 JavaScript",
    description: "你并不了解 JavaScript",
    lang: "zh-CN",
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
                    { text: "第三章：JS 寻根究底", link: "/get-started/ch3" },
                    { text: "第四章：大局观", link: "/get-started/ch4" },
                    { text: "附录 A：进一步的探索", link: "/get-started/apA" },
                    {
                        text: "附录 B：温故而知新",
                        link: "/get-started/apB",
                    },
                ],
            },
        ],

        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/liunnn1994/You-Dont-Know-JS-zh-CN",
            },
        ],
    },
});
