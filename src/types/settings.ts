import type { AIProviderId } from './ai';

/** 分类模式：ai=大模型智能分类  local=本地规则分类（无需联网） */
export type ClassifyMode = 'ai' | 'local';

/** 用户设置接口 — 持久化到 GM_getValue/GM_setValue */
export interface Settings {
  // 分类模式
  classifyMode: ClassifyMode;

  // 本地规则（local 模式使用，每行一条：分类名: 关键词1,关键词2,...）
  localRules: string;

  // AI 服务商
  provider: AIProviderId;
  customBaseUrl: string;
  apiKey: string;
  modelName: string;

  // AI 请求参数
  aiChunkSize: number;
  aiConcurrency: number;

  // 抓取限制
  limitEnabled: boolean;
  limitCount: number;

  // 速度控制
  fetchDelay: number;
  writeDelay: number;
  moveChunkSize: number;

  // 行为开关
  skipDeadVideos: boolean;
  adaptiveRate: boolean;
  notifyOnComplete: boolean;
  multiFolderEnabled: boolean;
  animEnabled: boolean;
  incrementalMode: boolean;

  // 允许 AI 创建新分类（关闭时只归入已有收藏夹）
  allowNewCategories: boolean;
  // 默认收藏夹保护：整理来源为「默认收藏夹」时，复制而不是移动（默认夹保留原视频）
  keepDefaultFolder: boolean;
  // 每次整理前自动备份
  autoBackupBeforeRun: boolean;

  // 批量休息防风控
  batchRestInterval: number;
  batchRestMinutes: number;

  // 后台缓存
  bgCacheEnabled: boolean;
  cacheScanInterval: number;

  // 自定义 Prompt
  lastPrompt: string;
}

/** 本地规则默认模板（通用示例，请按你自己的收藏内容修改）
 *  每行一条：分类名: 关键词1,关键词2,...  （以 # 开头的行会被忽略） */
export const DEFAULT_LOCAL_RULES = `# 请按你的实际情况修改下面的分类与关键词，例如：
编程开发: 编程,代码,python,java,javascript,前端,后端,算法,数据结构,数据库,linux
学习课程: 课程,教程,学习,公开课,网课,讲座,笔记,入门
科研学术: 论文,文献,科研,综述,实验,学术,写作,latex
数学: 数学,高数,线代,概率论,微积分,建模,矩阵
语言学习: 英语,单词,口语,日语,韩语,四级,六级,雅思
求职职场: 简历,面试,求职,实习,职场,offer,副业
音乐歌曲: 音乐,歌曲,BGM,翻唱,钢琴,纯音乐,歌单
影视娱乐: 电影,影视,解说,综艺,剧集,剪辑,动画
游戏: 游戏,攻略,实况,单机,手游,电竞
美食生活: 美食,做饭,菜谱,探店,吃播,生活,vlog,旅行
数码科技: 数码,手机,电脑,评测,开箱,硬件,外设
运动健身: 健身,运动,跑步,篮球,足球,羽毛球,瑜伽`;

/** 设置默认值 */
export const DEFAULT_SETTINGS: Settings = {
  classifyMode: 'ai',
  localRules: DEFAULT_LOCAL_RULES,
  provider: 'deepseek',
  customBaseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  modelName: 'deepseek-chat',
  aiChunkSize: 25,
  aiConcurrency: 1,
  limitEnabled: false,
  limitCount: 200,
  fetchDelay: 600,
  writeDelay: 1500,
  moveChunkSize: 20,
  skipDeadVideos: true,
  adaptiveRate: true,
  notifyOnComplete: true,
  multiFolderEnabled: false,
  animEnabled: true,
  incrementalMode: false,
  allowNewCategories: true,
  keepDefaultFolder: true,
  autoBackupBeforeRun: false,
  batchRestInterval: 80,
  batchRestMinutes: 1,
  bgCacheEnabled: false,
  cacheScanInterval: 15,
  lastPrompt: '',
};
