/**
 * 本地规则分类（无需联网 / 不消耗 AI Token）
 * 依据用户自定义的关键词规则，对视频标题 + UP主 + 简介 进行匹配打分归类。
 */

import type { VideoResource, CategoryResult } from '$types/index';
import { UNCATEGORIZED_FOLDER, DEFAULT_VIDEO_TYPE } from '$utils/constants';

export interface LocalRule {
  name: string;
  keywords: string[];
}

/**
 * 解析规则文本。
 * 每行一条，格式：`分类名: 关键词1,关键词2,...`
 * 兼容中英文冒号与逗号，忽略空行与以 # 开头的注释行。
 */
export function parseLocalRules(text: string): LocalRule[] {
  const rules: LocalRule[] = [];
  if (!text) return rules;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;

    const sepIdx = line.search(/[:：]/);
    if (sepIdx < 0) continue;

    const name = line.slice(0, sepIdx).trim();
    const kwPart = line.slice(sepIdx + 1).trim();
    if (!name || !kwPart) continue;

    const keywords = kwPart
      .split(/[,，、|]+/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (keywords.length > 0) {
      rules.push({ name, keywords });
    }
  }
  return rules;
}

/** 统计单个关键词在文本中的出现次数（大小写不敏感的字面子串匹配） */
function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

/**
 * 本地规则分类：对每个视频与每条规则计算加权得分，取最高分归类。
 * 标题权重 3、UP主权重 2、简介权重 1；无任何命中时归入「未分类」。
 */
export function classifyLocally(
  videos: VideoResource[],
  rulesText: string,
): CategoryResult {
  const rules = parseLocalRules(rulesText);
  const result: CategoryResult = {};

  for (const v of videos) {
    const title = (v.title || '').toLowerCase();
    const up = (v.upper?.name || '').toLowerCase();
    const intro = (v.intro || '').toLowerCase();

    let bestName: string | null = null;
    let bestScore = 0;

    for (const rule of rules) {
      let score = 0;
      for (const kw of rule.keywords) {
        score += countOccurrences(title, kw) * 3;
        score += countOccurrences(up, kw) * 2;
        score += countOccurrences(intro, kw) * 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestName = rule.name;
      }
    }

    const catName = bestName ?? UNCATEGORIZED_FOLDER;
    if (!result[catName]) result[catName] = [];
    result[catName].push({
      id: v.id,
      type: v.type ?? DEFAULT_VIDEO_TYPE,
      conf: bestName ? Math.min(1, 0.4 + bestScore * 0.1) : 0.2,
    });
  }

  return result;
}
