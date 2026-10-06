<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$stores/settings';
  import { SPEED_PRESETS, AI_CHUNK_PRESETS } from '$utils/constants';
  import SettingsGroup from './SettingsGroup.svelte';
  import ProviderConfig from './ProviderConfig.svelte';
  import LiquidToggle from './LiquidToggle.svelte';
  import { focusGlow } from '$animations/micro';
  import { Cpu, SlidersHorizontal, ToggleRight } from 'lucide-svelte';
</script>

<div class="settings-panel">
  <!-- Group 0: 分类模式 -->
  <SettingsGroup title="分类模式" icon={Cpu} iconColor="#B0742F">
    <div class="mode-switch" role="tablist">
      <button
        type="button"
        class="mode-option"
        class:active={$settings.classifyMode === 'ai'}
        onclick={() => settings.update({ classifyMode: 'ai' })}
      >
        <span class="mode-title">AI 智能分类</span>
        <span class="mode-desc">调用大模型，理解标题+简介，精度高</span>
      </button>
      <button
        type="button"
        class="mode-option"
        class:active={$settings.classifyMode === 'local'}
        onclick={() => settings.update({ classifyMode: 'local' })}
      >
        <span class="mode-title">本地规则分类</span>
        <span class="mode-desc">离线关键词匹配，无需 API Key</span>
      </button>
    </div>

    {#if $settings.classifyMode === 'local'}
      <div class="local-rules">
        <label class="bfao-label" for="bfao-local-rules">分类规则（每行一条：分类名: 关键词1,关键词2,...）</label>
        <textarea
          id="bfao-local-rules"
          class="bfao-input bfao-local-textarea"
          rows="8"
          spellcheck="false"
          value={$settings.localRules}
          oninput={(e) => settings.update({ localRules: (e.target as HTMLTextAreaElement).value })}
        ></textarea>
        <div class="local-hint">
          标题命中权重最高，其次 UP 主，最后简介；未命中任何关键词的视频归入「未分类」。
        </div>
      </div>
    {/if}
  </SettingsGroup>

  <!-- Group 1: AI 配置 -->
  {#if $settings.classifyMode === 'ai'}
    <SettingsGroup title="AI 服务配置" icon={Cpu} iconColor="#B0742F">
      <ProviderConfig />
    </SettingsGroup>
  {/if}

  <!-- Group 2: 请求参数 -->
  <SettingsGroup title="请求参数" icon={SlidersHorizontal} iconColor="#6366f1">
    <div class="field-grid">
      <div class="bfao-field">
        <label class="bfao-label" for="bfao-chunk-size">AI 批次大小</label>
        <input
          id="bfao-chunk-size"
          class="bfao-input"
          type="number"
          min="1"
          max="9999"
          list="bfao-chunk-presets"
          value={$settings.aiChunkSize}
          onchange={(e) => {
            const v = Math.max(1, Number((e.target as HTMLInputElement).value) || 50);
            settings.update({ aiChunkSize: v });
          }}
        />
        <datalist id="bfao-chunk-presets">
          {#each AI_CHUNK_PRESETS as preset (preset.value)}
            <option value={preset.value}>{preset.label}</option>
          {/each}
        </datalist>
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-fetch-delay">请求速度</label>
        <select
          id="bfao-fetch-delay"
          class="bfao-select"
          value={$settings.fetchDelay}
          onchange={(e) =>
            settings.update({ fetchDelay: Number((e.target as HTMLSelectElement).value) })}
        >
          {#each SPEED_PRESETS as preset (preset.value)}
            <option value={preset.value}>{preset.label}</option>
          {/each}
        </select>
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-write-delay">写操作间隔 (ms)</label>
        <input
          id="bfao-write-delay"
          class="bfao-input"
          type="number"
          min="500"
          max="10000"
          step="100"
          value={$settings.writeDelay}
          oninput={(e) =>
            settings.update({ writeDelay: Number((e.target as HTMLInputElement).value) || 2500 })}
          use:focusGlow
        />
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-move-chunk">每次移动视频数</label>
        <input
          id="bfao-move-chunk"
          class="bfao-input"
          type="number"
          min="1"
          max="100"
          value={$settings.moveChunkSize}
          oninput={(e) =>
            settings.update({ moveChunkSize: Number((e.target as HTMLInputElement).value) || 20 })}
          use:focusGlow
        />
      </div>

      <div class="bfao-field full">
        <label class="bfao-checkbox-label">
          <input
            type="checkbox"
            checked={$settings.limitEnabled}
            onchange={(e) =>
              settings.update({ limitEnabled: (e.target as HTMLInputElement).checked })}
          />
          <span>限制处理数量</span>
        </label>
        {#if $settings.limitEnabled}
          <input
            class="bfao-input bfao-input-small sub-field-slide"
            type="number"
            min="10"
            max="5000"
            value={$settings.limitCount}
            oninput={(e) =>
              settings.update({ limitCount: Number((e.target as HTMLInputElement).value) || 200 })}
            use:focusGlow
          />
        {/if}
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-rest-interval">批量休息间隔</label>
        <select
          id="bfao-rest-interval"
          class="bfao-select"
          value={$settings.batchRestInterval}
          onchange={(e) =>
            settings.update({ batchRestInterval: Number((e.target as HTMLSelectElement).value) })}
        >
          <option value={50}>50次</option>
          <option value={80}>80次</option>
          <option value={100}>100次</option>
          <option value={150}>150次</option>
          <option value={200}>200次</option>
          <option value={300}>300次</option>
        </select>
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-rest-minutes">休息时长 (分)</label>
        <select
          id="bfao-rest-minutes"
          class="bfao-select"
          value={$settings.batchRestMinutes}
          onchange={(e) =>
            settings.update({ batchRestMinutes: Number((e.target as HTMLSelectElement).value) })}
        >
          <option value={0.5}>0.5分钟</option>
          <option value={1}>1分钟</option>
          <option value={1.5}>1.5分钟</option>
          <option value={2}>2分钟</option>
          <option value={3}>3分钟</option>
          <option value={5}>5分钟</option>
        </select>
      </div>
    </div>
  </SettingsGroup>

  <!-- Group 3: 行为开关 -->
  <SettingsGroup title="行为设置" icon={ToggleRight} iconColor="#10b981">
    <div class="toggle-list">
      <div class="toggle-row">
        <span>自适应限速</span>
        <LiquidToggle label="自适应限速" checked={$settings.adaptiveRate}
          onchange={(v) => settings.update({ adaptiveRate: v })} />
      </div>

      <div class="toggle-row">
        <span>完成后通知</span>
        <LiquidToggle label="完成后通知" checked={$settings.notifyOnComplete}
          onchange={(v) => settings.update({ notifyOnComplete: v })} />
      </div>

      <div class="toggle-row">
        <span title="开启后，AI 可在需要时新建收藏夹分类；关闭则只归类到已有收藏夹">允许 AI 创建新分类</span>
        <LiquidToggle label="允许 AI 创建新分类" checked={$settings.allowNewCategories}
          onchange={(v) => settings.update({ allowNewCategories: v })} />
      </div>

      <div class="toggle-row">
        <span>整理前自动备份</span>
        <LiquidToggle label="整理前自动备份" checked={$settings.autoBackupBeforeRun}
          onchange={(v) => settings.update({ autoBackupBeforeRun: v })} />
      </div>

      <div class="toggle-row">
        <span title="开启后，来源为「默认收藏夹」的视频会被复制到新分类，默认收藏夹保持不动">保留默认收藏夹 (复制)</span>
        <LiquidToggle label="保留默认收藏夹" checked={$settings.keepDefaultFolder}
          onchange={(v) => settings.update({ keepDefaultFolder: v })} />
      </div>

      <div class="toggle-row">
        <span>增量整理 (仅新增)</span>
        <LiquidToggle label="增量整理" checked={$settings.incrementalMode}
          onchange={(v) => settings.update({ incrementalMode: v })} />
      </div>

      <div class="toggle-row">
        <span>后台自动缓存</span>
        <LiquidToggle label="后台自动缓存" checked={$settings.bgCacheEnabled}
          onchange={(v) => settings.update({ bgCacheEnabled: v })} />
      </div>

      {#if $settings.bgCacheEnabled}
        <div class="sub-field sub-field-slide">
          <label class="bfao-label" for="bfao-cache-interval">缓存间隔 (分)</label>
          <select
            id="bfao-cache-interval"
            class="bfao-select bfao-input-small"
            value={$settings.cacheScanInterval}
            onchange={(e) =>
              settings.update({ cacheScanInterval: Number((e.target as HTMLSelectElement).value) })}
          >
            <option value={5}>5</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </div>
      {/if}
    </div>
  </SettingsGroup>

</div>

<style>
  .settings-panel {
    padding: 10px 15px 12px;
    background: var(--ai-bg-secondary);
    border-bottom: 1px solid var(--ai-border-light);
  }

  /* ===== 分类模式切换 ===== */
  .mode-switch {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .mode-option {
    display: flex;
    flex-direction: column;
    gap: 3px;
    text-align: left;
    padding: 10px 12px;
    border: 1.5px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-bg);
    color: var(--ai-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .mode-option:hover {
    border-color: var(--ai-primary-light);
    background: var(--ai-bg-hover);
  }
  .mode-option.active {
    border-color: var(--ai-primary);
    background: var(--ai-primary-bg);
    box-shadow: 0 2px 10px var(--ai-primary-shadow);
  }
  .mode-title {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--ai-text);
  }
  .mode-option.active .mode-title {
    color: var(--ai-primary);
  }
  .mode-desc {
    font-size: 10.5px;
    line-height: 1.4;
    color: var(--ai-text-muted);
  }

  .local-rules {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .bfao-local-textarea {
    width: 100%;
    resize: vertical;
    min-height: 120px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11.5px;
    line-height: 1.6;
  }
  .local-hint {
    font-size: 10.5px;
    line-height: 1.5;
    color: var(--ai-text-muted);
  }

  /* Divider line between settings groups */
  .settings-panel > :global(.group + .group) {
    position: relative;
  }
  .settings-panel > :global(.group + .group::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--ai-primary-light) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: dividerFadeIn 0.5s ease 0.3s both, dividerSlide 6s ease-in-out 0.8s infinite;
  }

  @keyframes dividerFadeIn {
    from { opacity: 0; transform: scaleX(0); }
    to { opacity: 1; transform: scaleX(1); }
  }

  @keyframes dividerSlide {
    0%, 100% { background-position: 100% 0; }
    50% { background-position: 0% 0; }
  }

  /* Stagger entrance for each SettingsGroup when panel mounts */
  .settings-panel > :global(.group) {
    animation: groupSlideIn 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }
  .settings-panel > :global(.group:nth-child(1)) { animation-delay: 0s; }
  .settings-panel > :global(.group:nth-child(2)) { animation-delay: 0.06s; }
  .settings-panel > :global(.group:nth-child(3)) { animation-delay: 0.12s; }
  .settings-panel > :global(.group:nth-child(4)) { animation-delay: 0.18s; }

  @keyframes groupSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  /* Field grid stagger entrance — odd/even with different delays */
  .field-grid > :global(.bfao-field) {
    animation: fieldGridFadeIn 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }
  .field-grid > :global(.bfao-field:nth-child(odd)) { animation-delay: 0.03s; }
  .field-grid > :global(.bfao-field:nth-child(even)) { animation-delay: 0.08s; }
  .field-grid > :global(.bfao-field:nth-child(n+3)) { animation-delay: 0.13s; }
  .field-grid > :global(.bfao-field:nth-child(n+5)) { animation-delay: 0.18s; }
  .field-grid > :global(.bfao-field:nth-child(n+7)) { animation-delay: 0.23s; }
  @keyframes fieldGridFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Active field glow — focused field container gets inset depth */
  .field-grid .bfao-field:focus-within {
    background: var(--ai-bg-hover);
    border-radius: 8px;
    padding: 6px;
    margin: -6px;
    box-shadow: var(--ai-field-active-glow);
    transition: background 0.25s ease, box-shadow 0.25s ease;
  }

  .full {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .toggle-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12.5px;
    color: var(--ai-text-secondary);
    transition: background 0.2s ease, transform 0.25s cubic-bezier(0.2, 0.98, 0.28, 1), border-color 0.25s ease;
    border-radius: 6px;
    padding: 4px 6px;
    margin: -4px -6px;
    border-left: 2px solid transparent;
    padding-left: 4px;
  }

  .toggle-row > span:first-child {
    transition: color 0.2s ease;
    position: relative;
  }

  .toggle-row > span:first-child::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, var(--ai-primary), var(--ai-gradient-accent));
    border-radius: 0.5px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s cubic-bezier(0.2, 0.98, 0.28, 1);
    pointer-events: none;
  }

  .toggle-row:hover > span:first-child::after {
    transform: scaleX(1);
  }

  .toggle-row:hover {
    background: var(--ai-bg-hover);
    transform: translateX(3px);
  }

  .toggle-row:hover > span:first-child {
    color: var(--ai-text);
  }

  /* Active indicator — enabled toggles show a brand-color left bar with expand animation + ambient glow */
  .toggle-row:has(:global(.on)) {
    border-left-color: var(--ai-primary);
    box-shadow: var(--ai-glow-active-row);
    animation: activeBarExpand 0.35s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  @keyframes activeBarExpand {
    0% { border-left-color: transparent; }
    50% { border-left-color: var(--ai-border-active-glow); }
    100% { border-left-color: var(--ai-primary); }
  }

  .sub-field {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 23px;
  }

  .sub-field-slide {
    animation: subFieldSlideIn 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  .sub-field.sub-field-slide {
    background: var(--ai-bg-hover);
    border-radius: 8px;
    padding: 6px 8px 6px 23px;
    margin: -2px -8px;
  }

  @keyframes subFieldSlideIn {
    0% { opacity: 0; transform: translateY(-6px); }
    70% { opacity: 1; transform: translateY(1px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .toggle-row:hover { transform: none; }
    .toggle-row:has(:global(.on)) { animation: none; box-shadow: none; }
    .field-grid > :global(.bfao-field) { animation: none; }
    .toggle-row > span:first-child::after { display: none; }
    .sub-field-slide { animation: none; }
    .settings-panel > :global(.group) { animation: none; }
    .settings-panel > :global(.group + .group::before) { animation: none; opacity: 1; transform: scaleX(1); background-position: 50% 0; }
    .field-grid .bfao-field:focus-within { transition: none; }
  }
</style>
