import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey, { cdn } from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    svelte(),
    monkey({
      entry: 'src/main.ts',
      server: {
        open: false,
      },
      userscript: {
        name: '「小明」AI B站收藏夹智能整理器',
        namespace: 'https://space.bilibili.com/570049863',
        version: '2.1.0',
        description:
          'DeepSeek 深度语义分类 B 站收藏夹视频 | 结合标题+UP主+简介精准归类 | 两阶段类目规划预览 | 失效视频归档/去重/备份/撤销 | Svelte + GSAP 精致动画 | 基于 madoka-chann(B站-是小圆_喲) 开源项目二次开发增强 | 最初模板感谢 B站某不知名的根号三',
        author: 'b站 小明同学鸭-（基于 madoka-chann 增强；原作者 B站-是小圆_喲 & 根号三）',
        license: 'MIT',
        homepageURL: 'https://github.com/xm2284/bili-ai-favorites-organizer',
        supportURL: 'https://github.com/xm2284/bili-ai-favorites-organizer/issues',
        updateURL: 'https://raw.githubusercontent.com/xm2284/bili-ai-favorites-organizer/main/dist/bilibili-ai-favorites-organizer-pro.user.js',
        downloadURL: 'https://raw.githubusercontent.com/xm2284/bili-ai-favorites-organizer/main/dist/bilibili-ai-favorites-organizer-pro.user.js',
        match: ['*://*.bilibili.com/*'],
        'run-at': 'document-idle',
        require: [
          'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js',
          'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/Flip.min.js',
          'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/Draggable.min.js',
          'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/CustomEase.min.js',
        ],
        grant: [
          'GM_xmlhttpRequest',
          'GM_getValue',
          'GM_setValue',
          'GM_addStyle',
        ],
        connect: [
          'generativelanguage.googleapis.com',
          'api.openai.com',
          'api.deepseek.com',
          'api.siliconflow.cn',
          'dashscope.aliyuncs.com',
          'api.moonshot.cn',
          'open.bigmodel.cn',
          'api.groq.com',
          'api.anthropic.com',
          'models.github.ai',
          'localhost',
          'openrouter.ai',
          '*', // 自定义 OpenAI 兼容端点需要; SSRF 由 ai-providers.ts isPrivateHost() 防护
        ],
      },
      build: {
        externalGlobals: {
          gsap: 'gsap',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      $api: '/src/api',
      $core: '/src/core',
      $stores: '/src/stores',
      $types: '/src/types',
      $utils: '/src/utils',
      $components: '/src/components',
      $animations: '/src/animations',
      $styles: '/src/styles',
      $actions: '/src/actions',
    },
  },
});
