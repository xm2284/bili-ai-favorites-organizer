import { describe, it, expect } from 'vitest';
import { parseLocalRules, classifyLocally } from './local-classify';
import type { VideoResource } from '$types/index';
import { UNCATEGORIZED_FOLDER } from '$utils/constants';

function video(partial: Partial<VideoResource>): VideoResource {
  return {
    id: 1,
    type: 2,
    title: '',
    bvid: '',
    intro: '',
    duration: 0,
    pubtime: 0,
    fav_time: 0,
    cnt_info: { play: 0, collect: 0, danmaku: 0 },
    upper: { mid: 0, name: '', face: '' },
    cover: '',
    link: '',
    ...partial,
  } as VideoResource;
}

describe('parseLocalRules', () => {
  it('parses "分类: 关键词" lines with Chinese and English separators', () => {
    const rules = parseLocalRules('编程: 代码,python，java\n游戏：攻略、实况');
    expect(rules).toHaveLength(2);
    expect(rules[0].name).toBe('编程');
    expect(rules[0].keywords).toEqual(['代码', 'python', 'java']);
    expect(rules[1].name).toBe('游戏');
    expect(rules[1].keywords).toEqual(['攻略', '实况']);
  });

  it('ignores blank lines and comments', () => {
    const rules = parseLocalRules('# comment\n\n编程: 代码\n// another');
    expect(rules).toHaveLength(1);
    expect(rules[0].name).toBe('编程');
  });

  it('skips lines without a separator or without keywords', () => {
    expect(parseLocalRules('没有冒号的一行')).toHaveLength(0);
    expect(parseLocalRules('空分类: ')).toHaveLength(0);
  });
});

describe('classifyLocally', () => {
  const rules = '编程: python,代码\n音乐: 歌曲,翻唱';

  it('assigns a video to the matching category by title keyword', () => {
    const result = classifyLocally(
      [video({ id: 1, title: 'Python 入门教程' })],
      rules,
    );
    expect(Object.keys(result)).toEqual(['编程']);
    expect(result['编程'][0].id).toBe(1);
    expect(result['编程'][0].type).toBe(2);
    expect(result['编程'][0].conf).toBeGreaterThan(0);
  });

  it('puts unmatched videos into 未分类', () => {
    const result = classifyLocally([video({ id: 9, title: '随便看看' })], rules);
    expect(result[UNCATEGORIZED_FOLDER]?.[0]?.id).toBe(9);
    expect(result[UNCATEGORIZED_FOLDER][0].conf).toBeLessThanOrEqual(0.5);
  });

  it('weights title matches higher than intro matches', () => {
    const result = classifyLocally(
      [video({ id: 5, title: 'python 实战', intro: '这是一首歌 翻唱' })],
      rules,
    );
    expect(result['编程']).toBeTruthy();
    expect(result['音乐']).toBeUndefined();
  });

  it('matches by UP name when title has no keyword', () => {
    const result = classifyLocally(
      [video({ id: 7, title: '最新一期', upper: { mid: 1, name: '翻唱小王子', face: '' } })],
      rules,
    );
    expect(result['音乐']?.[0]?.id).toBe(7);
  });
});
