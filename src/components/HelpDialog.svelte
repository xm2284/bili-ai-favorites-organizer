<script lang="ts">
  import { onMount } from 'svelte';
  import Modal from './Modal.svelte';
  import { HelpCircle, ChevronRight } from 'lucide-svelte';
  import { gsap, EASINGS, shouldAnimate } from '$animations/gsap-config';

  interface Props {
    onclose?: () => void;
  }

  let { onclose }: Props = $props();

  let expandedIdx = $state<number | null>(null);
  let helpBodyEl = $state<HTMLElement>(undefined!);

  /** 答案节点引用，用于 GSAP 高度动画 */
  let answerEls: Record<number, HTMLDivElement | null> = {};

  /** Stagger only .faq-item buttons (not .faq-a answer divs) */
  onMount(() => {
    if (!shouldAnimate() || !helpBodyEl) return;
    const items = helpBodyEl.querySelectorAll('.faq-item');
    if (items.length > 0) {
      gsap.fromTo(items,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, delay: 0.1, ease: EASINGS.velvetSpring }
      );
    }
  });

  function toggle(idx: number) {
    const prevIdx = expandedIdx;

    if (prevIdx === idx) {
      collapseAnswer(idx);
      expandedIdx = null;
    } else {
      if (prevIdx !== null) collapseAnswer(prevIdx);
      expandedIdx = idx;
      expandAnswer(idx);
    }
  }

  function expandAnswer(idx: number) {
    const node = answerEls[idx];
    if (!node) return;
    if (!shouldAnimate()) {
      node.style.height = 'auto';
      node.style.opacity = '1';
      return;
    }
    node.style.overflow = 'hidden';
    gsap.fromTo(node,
      { height: 0, opacity: 0 },
      { height: 'auto', opacity: 1, duration: 0.3, ease: EASINGS.velvetSpring,
        onComplete: () => { node.style.overflow = ''; } }
    );
  }

  function collapseAnswer(idx: number) {
    const node = answerEls[idx];
    if (!node) return;
    if (!shouldAnimate()) {
      node.style.height = '0';
      node.style.opacity = '0';
      return;
    }
    node.style.overflow = 'hidden';
    gsap.to(node, {
      height: 0, opacity: 0, duration: 0.22, ease: EASINGS.silkOut,
    });
  }

  const FAQ: Array<{ q: string; a: string }> = [
    { q: 'API Key 从哪获取？', a: '在对应 AI 服务商的开发者控制台创建 API Key。例如 Gemini 在 ai.google.dev，OpenAI 在 platform.openai.com，DeepSeek 在 platform.deepseek.com 等。' },
    { q: '应该选哪个模型？', a: '推荐 Gemini 2.5 Flash (免费)、DeepSeek V3 (便宜)、GPT-4o-mini (稳定)。模型越大分类越精准但更贵更慢。' },
    { q: '为什么报错 412？', a: 'B站反爬限制。增大「写操作间隔」和「批量休息间隔」，或开启「自适应限速」。' },
    { q: 'AI 并发数设多少？', a: '2-3 为稳定值。过高会触发 AI 服务商限频，过低则速度慢。' },
    { q: '处理 8000 个视频要多久？', a: '取决于 AI 服务商速度和并发数。Gemini Flash 约 5-15 分钟，DeepSeek 约 10-20 分钟。' },
    { q: '可以撤销移动操作吗？', a: '可以。整理完成后点击「撤销」按钮，将还原本次所有移动操作。撤销数据保存在本地。' },
    { q: '自适应限速是什么？', a: '当检测到 B 站 API 返回限频错误时，自动增加请求间隔，避免被封。' },
    { q: '备份功能怎么用？', a: '点击「备份」按钮导出当前所有收藏夹的视频列表为 JSON 文件。可用于灾难恢复。' },
    { q: 'AI 测试是什么？', a: 'Ctrl+点击「帮助」按钮可打开预览界面调试模式，使用假数据测试分类预览的 UI 和交互。' },
    { q: '暗色模式怎么用？', a: '点击面板顶部的月亮/太阳图标切换亮色/暗色主题。支持跟随系统设置。' },
    { q: '支持哪些 AI 服务商？', a: 'Gemini、OpenAI、DeepSeek、硅基流动、通义千问、Moonshot、智谱、Groq、Anthropic、GitHub Models、OpenRouter、Ollama 本地、以及任何 OpenAI 兼容端点。' },
    { q: 'Token 用量与费用估算', a: '处理过程中进度条下方实时显示 Token 消耗。完成后日志中会显示总用量和预估费用。' },
    { q: '增量整理是什么？', a: '开启后只处理上次整理之后新收藏的视频，避免重复处理已分类的视频。' },
    { q: '自定义模板怎么用？', a: '在 Prompt 编辑器中输入自定义规则，点击保存按钮可保存为预设。可设为默认预设。' },
    { q: '收藏夹健康检查', a: '点击「健康」按钮检测各收藏夹的失效视频数量、重复视频等问题。' },
    { q: '导出分类结果', a: '在预览界面底部点击复制/下载/导出按钮，可将分类结果以文本/JSON/Markdown 格式导出。' },
    { q: '如何合并相似分类？', a: '在预览界面点击「合并分类」按钮，先点选源分类，再点选目标分类即可合并。' },
    { q: '设置可以导出分享吗？', a: '暂不支持。设置保存在 Tampermonkey 的本地存储中。' },
    { q: '日志可以导出吗？', a: '可以。点击「日志」按钮导出为 .txt 文件。' },
    { q: 'AI 请求失败会自动重试吗？', a: '会。单次请求失败后最多重试 2 次，间隔递增。' },
    { q: '重复视频可以一键清理吗？', a: '可以。点击「查重」按钮扫描后，选择要清理的重复项执行即可。' },
    { q: '失效视频归档功能', a: '失效视频会被自动检测并归入「失效视频归档」收藏夹，不会浪费 AI Token。' },
    { q: '低置信度筛选', a: '在预览界面点击「低置信度」按钮可筛选出 AI 分类置信度低于 60% 的视频，方便人工确认。' },
  ];
</script>

<Modal title="帮助与常见问题" showFooter={false} width="min(600px, 92vw)" onclose={() => onclose?.()}>
  {#snippet icon()}<HelpCircle size={18} />{/snippet}

  <div class="help-body" bind:this={helpBodyEl}>
    <div class="guide-intro">
      <svg class="guide-flow" viewBox="0 0 512 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="使用流程">
        <g fill="none" stroke="#b0742f" stroke-width="1.6">
          <rect x="2" y="14" width="104" height="36" rx="8" fill="#f7f0e2"/>
          <rect x="138" y="14" width="104" height="36" rx="8" fill="#f7f0e2"/>
          <rect x="274" y="14" width="104" height="36" rx="8" fill="#f7f0e2"/>
          <rect x="406" y="14" width="104" height="36" rx="8" fill="#eef3e4"/>
        </g>
        <g stroke="#b0742f" stroke-width="1.6" fill="none">
          <path d="M106 32 h30" marker-end="url(#ah)"/>
          <path d="M242 32 h30" marker-end="url(#ah)"/>
          <path d="M378 32 h26" marker-end="url(#ah)"/>
        </g>
        <defs>
          <marker id="ah" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#b0742f"/>
          </marker>
        </defs>
        <g fill="#3a3125" font-size="13" font-weight="600" text-anchor="middle" font-family="sans-serif">
          <text x="54" y="37">选收藏夹</text>
          <text x="190" y="37">AI / 本地分类</text>
          <text x="326" y="37">预览确认</text>
          <text x="458" y="37">执行完成</text>
        </g>
      </svg>

      <ol class="guide-steps">
        <li><b>选收藏夹</b>：点「开始整理」，勾选要整理的收藏夹。</li>
        <li><b>选模式</b>：AI 智能分类（推荐，需 API Key）或 本地规则（离线，精度略低）。</li>
        <li><b>确认后执行</b>：预览只是建议，点「确认执行」才会真正移动。</li>
      </ol>
      <p class="guide-tip">没填 API Key？设置 →「AI 服务配置」填 Key，点 ⚡ 测连通。（DeepSeek 官网可申请）</p>
    </div>

    {#each FAQ as item, idx (idx)}
      <button class="faq-item" class:open={expandedIdx === idx} onclick={() => toggle(idx)}>
        <span class="faq-q">
          <span class="faq-icon" class:pulse={expandedIdx === idx}></span>
          {item.q}
        </span>
        <ChevronRight size={14} class="faq-chevron" />
      </button>
      <div class="faq-a" bind:this={answerEls[idx]} style:height="0" style:opacity="0" style:overflow="hidden">
        {item.a}
      </div>
    {/each}

    <div class="help-footer">
      快捷键: <kbd>Alt+B</kbd> 呼出面板 · <kbd>ESC</kbd> 关闭 · <kbd>Ctrl+Enter</kbd> 开始
    </div>

    <div class="help-credit">
      <div class="credit-line">整理器作者：b站 小明同学鸭-</div>
      <div class="credit-line muted">
        基于开源项目
        <a href="https://github.com/madoka-chann/Bilibili-AI-Favorites-Organizer" target="_blank" rel="noopener">madoka-chann/Bilibili-AI-Favorites-Organizer</a>
        二次开发增强
      </div>
      <div class="credit-line muted">原作者：B站-是小圆_喲 · 最初模板：B站某不知名的根号三</div>
    </div>
  </div>
</Modal>

<style>
  .help-body {
    padding: 0;
    max-height: 60vh;
    overflow-y: auto;
    mask-image: linear-gradient(
      to bottom,
      transparent 0px,
      black 10px,
      black calc(100% - 10px),
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0px,
      black 10px,
      black calc(100% - 10px),
      transparent 100%
    );
    counter-reset: faq-counter;
  }

  .faq-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 20px;
    border: none;
    border-bottom: 1px solid var(--ai-border-light);
    border-left: 3px solid transparent;
    background: none;
    cursor: pointer;
    transition: background 0.2s, padding-left 0.2s ease, border-left-color 0.2s ease;
    text-align: left;
  }
  .faq-item:hover {
    background: var(--ai-bg-tertiary);
    padding-left: 24px;
  }
  .faq-item.open {
    border-left-color: var(--ai-primary);
    background: var(--ai-bg-secondary);
    padding-left: 24px;
    box-shadow: var(--ai-shadow-inset);
  }

  .faq-q {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ai-text);
  }

  .faq-item {
    counter-increment: faq-counter;
  }

  .faq-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--ai-error-bg, rgba(239, 68, 68, 0.1));
    color: var(--ai-error, #ef4444);
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
  }
  .faq-icon::before {
    content: counter(faq-counter);
  }
  .faq-item.open .faq-icon {
    transform: rotateY(180deg);
    background: var(--ai-primary-bg);
    color: var(--ai-primary);
  }

  .faq-item:hover .faq-icon:not(.pulse) {
    transform: rotate(15deg) scale(1.1);
  }

  .faq-item :global(.faq-chevron) {
    color: var(--ai-text-muted);
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .faq-item.open :global(.faq-chevron) { transform: rotate(90deg); }

  .faq-a {
    padding: 6px 20px 10px 50px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--ai-text-secondary);
    background: var(--ai-bg-secondary);
    box-sizing: border-box;
    position: relative;
  }
  /* Reveal animation scoped to open state — avoids conflict with GSAP height:0 */
  .faq-item.open + .faq-a {
    clip-path: inset(0 100% 0 0);
    animation: answerReveal 0.45s cubic-bezier(0.2, 0.98, 0.28, 1) 0.08s both;
  }
  @keyframes answerReveal {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }
  .faq-a::before {
    content: '';
    position: absolute;
    left: 28px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--ai-primary), transparent);
    border-radius: 1px;
    transform: scaleY(0);
    transform-origin: top;
    animation: answerBar 0.35s cubic-bezier(0.2, 0.98, 0.28, 1) 0.1s both;
  }
  @keyframes answerBar {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }

  .faq-icon.pulse {
    animation: iconPulse 1.5s ease-in-out infinite;
  }

  @keyframes iconPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
    50% { box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
  }

  .help-footer {
    padding: 12px 20px;
    font-size: 11px;
    color: var(--ai-text-muted);
    text-align: center;
    animation: footerFadeIn 0.4s ease 0.6s both;
  }
  .help-footer kbd {
    display: inline-block;
    padding: 1px 5px;
    font-size: 10px;
    font-family: inherit;
    font-weight: 600;
    color: var(--ai-primary);
    background: var(--ai-primary-bg);
    border: 1px solid var(--ai-border-light);
    border-radius: 4px;
    margin: 0 1px;
    animation: kbdPop 0.3s cubic-bezier(0.22, 1.42, 0.29, 1) both;
  }
  .help-footer kbd:nth-of-type(1) { animation-delay: 0.7s; }
  .help-footer kbd:nth-of-type(2) { animation-delay: 0.78s; }
  .help-footer kbd:nth-of-type(3) { animation-delay: 0.86s; }

  @keyframes kbdPop {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes footerFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .guide-intro {
    padding: 12px 20px 10px;
    border-bottom: 1px solid var(--ai-border-light);
  }
  .guide-flow {
    width: 100%;
    height: auto;
    display: block;
    margin: 0 0 10px;
  }
  .guide-steps {
    margin: 0 0 8px;
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.85;
    color: var(--ai-text-secondary);
  }
  .guide-steps b {
    color: var(--ai-primary);
  }
  .guide-tip {
    margin: 0;
    font-size: 12px;
    color: var(--ai-text-muted);
    line-height: 1.6;
  }

  .help-credit {
    padding: 10px 20px 14px;
    text-align: center;
    border-top: 1px dashed var(--ai-border-light);
    animation: footerFadeIn 0.4s ease 0.7s both;
  }
  .credit-line {
    font-size: 11px;
    line-height: 1.7;
    color: var(--ai-text-secondary);
  }
  .credit-line.muted {
    color: var(--ai-text-muted);
    font-size: 10px;
  }
  .credit-line a {
    color: var(--ai-primary);
    text-decoration: none;
    font-weight: 600;
  }
  .credit-line a:hover {
    text-decoration: underline;
  }

  @media (prefers-reduced-motion: reduce) {
    .help-footer { animation: none; opacity: 1; }
    .help-footer kbd { animation: none; opacity: 1; }
    .faq-icon.pulse { animation: none; }
    .faq-item { transition: background 0.2s; }
    .faq-item:hover { padding-left: 20px; }
    .faq-item.open { box-shadow: none; }
    .faq-icon { transition: none; }
    .faq-item.open .faq-icon { transform: none; }
    .faq-item:hover .faq-icon:not(.pulse) { transform: none; }
    .faq-a { clip-path: none; animation: none; }
    .faq-a::before { animation: none; transform: scaleY(1); }
  }
</style>
