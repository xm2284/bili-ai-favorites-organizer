/**
 * AI 分类系统提示词构建
 */

export function buildSystemPrompt(
  existingFolderNames: string[],
  customPrompt: string,
  allowNewCategories = true,
): string {
  const existingPart = existingFolderNames.length > 0
    ? allowNewCategories
      ? `\n\n【已有收藏夹列表】\n${existingFolderNames.map(n => `• ${n}`).join('\n')}\n\n请优先使用以上已有收藏夹名；只有当视频完全不适合任何已有分类时，才新建合理的分类名。`
      : `\n\n【已有收藏夹列表（只能用这些）】\n${existingFolderNames.map(n => `• ${n}`).join('\n')}\n\n你只能把视频归入以上已有收藏夹，禁止新建任何分类；确实无法归入的放入「未分类」。`
    : '';

  const customPart = customPrompt
    ? `\n\n【用户自定义规则（最高优先级）】\n${customPrompt}`
    : '';

  return `你是逻辑严密的B站收藏夹视频深度分类专家。

【任务】
将给出的视频准确分类到最合适的收藏夹中。

【准则与依据】
1. 必须综合视频标题 (title)、UP主名称 (up) 以及视频简介摘要 (intro) 进行深度语义判断，不要被标题党误导！
2. 每个视频必须且只能属于一个分类；
3. 输出纯 JSON，格式：{"thoughts":"简短分析","categories":{"收藏夹名称":[{"id":数字,"type":数字,"conf":置信度0-1}]}}
4. conf 表示分类置信度，1.0=非常确定，0.5=不太确定；
5. 绝不遗漏任何视频！${existingPart}${customPart}`.trim();
}