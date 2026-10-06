import { mount } from 'svelte';
import App from './App.svelte';
import { setupBackgroundCache } from '$core/background-cache';
import { gmGetValue, gmSetValue } from '$utils/gm';
import { DEFAULT_LOCAL_RULES } from '$types/index';

// ============ 防止脚本重复注入（多个版本同时安装会产生两个悬浮球） ============
declare global {
  interface Window {
    __bfaoProInjected?: boolean;
  }
}

// 一次性迁移：默认关闭花哨动画（用户仍可在设置中重新开启）
if (!gmGetValue('bfao_animMigrated_v21', false)) {
  gmSetValue('bfao_animEnabled', false);
  gmSetValue('bfao_animMigrated_v21', true);
}

// 一次性迁移：调快读取速度（旧默认 1200ms → 新默认 600ms），减少开始整理前的等待
if (!gmGetValue('bfao_speedMigrated_v21', false)) {
  const cur = gmGetValue<number>('bfao_fetchDelay', 600);
  if (cur >= 1000) gmSetValue('bfao_fetchDelay', 600);
  gmSetValue('bfao_speedMigrated_v21', true);
}

// 一次性迁移：自动备份改为默认关闭（由用户在「设置」里自行开启）
if (!gmGetValue('bfao_backupDefaultMigrated_v21', false)) {
  gmSetValue('bfao_autoBackupBeforeRun', false);
  gmSetValue('bfao_backupDefaultMigrated_v21', true);
}

// 一次性迁移：把包含个人分类(如"蓝桥杯")的旧本地规则重置为通用示例
if (!gmGetValue('bfao_rulesMigrated_v21', false)) {
  const rules = gmGetValue<string>('bfao_localRules', '');
  if (rules.includes('蓝桥杯') || rules.includes('硕博科研')) {
    gmSetValue('bfao_localRules', DEFAULT_LOCAL_RULES);
  }
  gmSetValue('bfao_rulesMigrated_v21', true);
}

// 仅在 B站个人空间页面注入完整 UI
const isSpacePage = /space\.bilibili\.com/.test(location.href);

if (isSpacePage && !window.__bfaoProInjected) {
  window.__bfaoProInjected = true;

  // 清理同一页面中由旧版脚本遗留的实例，避免出现两个悬浮球
  function removeForeignRoots(keep?: Element) {
    document.querySelectorAll('#bfao-root, .bfao-app').forEach((el) => {
      if (keep && (el === keep || keep.contains(el))) return;
      el.remove();
    });
  }
  removeForeignRoots();

  // 创建挂载容器
  const container = document.createElement('div');
  container.id = 'bfao-root';
  document.body.appendChild(container);

  // 挂载 Svelte App
  mount(App, { target: container });

  // 若旧版脚本晚于本脚本注入，持续清理其遗留的根节点
  const observer = new MutationObserver(() => removeForeignRoots(container));
  observer.observe(document.body, { childList: true, subtree: false });
}

// 所有 B站页面都启动后台缓存扫描
setupBackgroundCache();
