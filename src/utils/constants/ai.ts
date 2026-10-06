import type { AIProviderRegistry, SpeedPreset, ChunkPreset, PromptPreset } from '$types/index';

// ================= AI 服务商注册表 =================
export const AI_PROVIDERS: AIProviderRegistry = {
  deepseek: {
    name: 'DeepSeek (官方)',
    format: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    keyPlaceholder: '从 platform.deepseek.com 获取',
    apiUrl: 'https://platform.deepseek.com/api_keys',
  },
  siliconflow: {
    name: '硅基流动',
    format: 'openai',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    keyPlaceholder: '从 cloud.siliconflow.cn 获取',
    apiUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  gemini: {
    name: 'Google Gemini',
    format: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.5-flash',
    keyPlaceholder: '从 aistudio.google.com/apikey 获取',
    apiUrl: 'https://aistudio.google.com/apikey',
  },
  openai: {
    name: 'OpenAI',
    format: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    keyPlaceholder: '从 platform.openai.com 获取',
    apiUrl: 'https://platform.openai.com/api-keys',
  },
  qwen: {
    name: '通义千问 (Qwen)',
    format: 'openai',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    keyPlaceholder: '从 dashscope.aliyun.com 获取',
    apiUrl: 'https://dashscope.console.aliyun.com/apikey',
  },
  moonshot: {
    name: 'Moonshot (Kimi)',
    format: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    keyPlaceholder: '从 platform.moonshot.cn 获取',
    apiUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  zhipu: {
    name: '智谱 (GLM)',
    format: 'openai',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    keyPlaceholder: '从 open.bigmodel.cn 获取',
    apiUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  groq: {
    name: 'Groq',
    format: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    keyPlaceholder: '从 console.groq.com 获取',
    apiUrl: 'https://console.groq.com/keys',
  },
  openrouter: {
    name: 'OpenRouter',
    format: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash',
    keyPlaceholder: '从 openrouter.ai/keys 获取',
    apiUrl: 'https://openrouter.ai/keys',
  },
  ollama: {
    name: 'Ollama (本地)',
    format: 'openai',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
    keyPlaceholder: '本地运行无需 Key',
    apiUrl: '',
  },
  github: {
    name: 'GitHub Models',
    format: 'github',
    baseUrl: 'https://models.github.ai',
    defaultModel: 'openai/gpt-4o-mini',
    keyPlaceholder: '填入 GitHub Personal Access Token',
    apiUrl: 'https://docs.github.com/zh/github-models/quickstart',
  },
  anthropic: {
    name: 'Anthropic Claude',
    format: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022',
    keyPlaceholder: '从 console.anthropic.com 获取',
    apiUrl: 'https://console.anthropic.com/settings/keys',
  },
  custom: {
    name: '自定义 (OpenAI 兼容)',
    format: 'openai',
    baseUrl: '',
    defaultModel: '',
    keyPlaceholder: '填入 API Key',
    apiUrl: '',
    isCustom: true,
  },
};

// ================= AI 相关超时 =================
export const AI_TIMEOUT_MS = 300_000; // 5 分钟超时，杜绝断线

// ================= 速度预设 =================
export const SPEED_PRESETS: SpeedPreset[] = [
  { label: '安全防风控 (1.5s)', value: 1500, desc: '大收藏夹推荐，几乎不会触发风控' },
  { label: '标准稳健 (1.0s)', value: 1000, desc: '日常使用推荐，平衡速度与安全' },
  { label: '快速整理 (600ms)', value: 600, desc: '小收藏夹可用，有一定风控风险' },
];

// ================= AI 分块预设 =================
export const AI_CHUNK_PRESETS: ChunkPreset[] = [
  { label: '25条 (极度推荐)', value: 25, desc: '高质量精细分类，绝不超时' },
  { label: '50条', value: 50, desc: '标准批次' },
  { label: '100条', value: 100, desc: '大批量处理' },
];

// ================= 内置 Prompt 预设 =================
export const BUILTIN_PRESETS: PromptPreset[] = [
  { label: '自由发挥', value: '' },
  { label: '智能分类 (推荐)', value: '请综合视频的标题与简介，自行判断内容主题，归纳出 8~15 个清晰互斥的收藏夹分类' },
  { label: '按学科 / 技能', value: '请把学习类视频按学科或技能分类（如：编程开发、数学、外语、设计、考研考证等），娱乐类统一归为生活娱乐' },
  { label: '按内容类型', value: '请按视频内容类型分类，如：教程、评测、游戏、音乐、影视、生活、搞笑、体育、财经等大类' },
  { label: '按 UP 主 / 系列', value: '请按 UP 主或视频系列分类，同一个 UP 主的系列视频优先合并到同一个收藏夹，收藏夹名用 UP 主或系列名' },
  { label: '按时长分类', value: '请按视频时长分类：短视频(5分钟以内)、中视频(5-30分钟)、长视频(30分钟以上)' },
  { label: '按热度分类', value: '请按视频播放量分类：冷门(1万以下)、小众(1-10万)、热门(10-100万)、爆款(100万以上)' },
  { label: '按语言 / 地区', value: '请按视频的语言或内容地区分类，如：国产、日本、欧美、韩国等，同一地区内再按类型细分' },
  { label: '精细多级分类', value: '请尽量精细分类，同一大类下视频较多时拆分子类，收藏夹名格式：大类-子类' },
  { label: '待看优先级', value: '请按观看价值与紧迫度分类：必看精品、有空再看、背景音/放松、可清理；重点参考播放量与收藏时间' },
  { label: '工作 / 学习 / 生活', value: '请只分成三大块并按内容细分：工作与技能提升、学习与考试、生活与娱乐' },
];
