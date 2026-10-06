import { get } from 'svelte/store';
import type { BiliData, Settings } from '$types/index';
import { cancelRequested, logs } from '$stores/state';
import {
  lightFetchJson, scanAllFolderVideos,
  getAllFoldersWithIds, createFolder, moveVideos, invalidateFolderCache,
} from '$api/bilibili';
import { getErrorMessage } from '$utils/errors';
import { formatNow, humanDelay } from '$utils/timing';
import { triggerDownload } from '$utils/download';
import { withRunningState } from '$utils/running-state';
import { DEFAULT_VIDEO_TYPE } from '$utils/constants';

interface BackupVideoEntry {
  id: number;
  type: number;
  title: string;
  bvid: string;
  folderId: number;
  folderTitle: string;
  folderMediaCount: number;
}

export interface BackupData {
  version: string;
  time: string;
  timeLocal: string;
  mid: string;
  folders: Array<{
    id: number;
    title: string;
    media_count: number;
    videos: Array<{ id: number; type: number; title: string; bvid: string }>;
  }>;
}

/** 备份所有收藏夹 */
export async function backupFavorites(
  biliData: BiliData,
  fetchDelay: number,
): Promise<BackupData | null> {
  logs.add('正在备份收藏夹结构...', 'info');

  return withRunningState(async () => {
    try {
      const { results: videoEntries } = await scanAllFolderVideos<BackupVideoEntry>({
        biliData,
        fetchDelay,
        cancelCheck: () => get(cancelRequested),
        fetchFn: lightFetchJson,
        logPrefix: '备份',
        onVideo: (v, folder) => ({
          id: v.id,
          type: v.type ?? DEFAULT_VIDEO_TYPE,
          title: v.title,
          bvid: v.bvid || '',
          folderId: folder.id,
          folderTitle: folder.title,
          folderMediaCount: folder.media_count,
        }),
      });

      if (get(cancelRequested)) {
        logs.add('用户取消了备份', 'warning');
        return null;
      }

      // 按收藏夹分组
      const folderMap = new Map<number, BackupData['folders'][0]>();
      for (const entry of videoEntries) {
        let folderData = folderMap.get(entry.folderId);
        if (!folderData) {
          folderData = {
            id: entry.folderId,
            title: entry.folderTitle,
            media_count: entry.folderMediaCount,
            videos: [],
          };
          folderMap.set(entry.folderId, folderData);
        }
        folderData.videos.push({
          id: entry.id, type: entry.type, title: entry.title, bvid: entry.bvid,
        });
      }

      const { time, timeLocal } = formatNow();
      const backup: BackupData = {
        version: '1.0',
        time,
        timeLocal,
        mid: biliData.mid,
        folders: Array.from(folderMap.values()),
      };

      const totalVideos = backup.folders.reduce((s, f) => s + f.videos.length, 0);
      logs.add(`备份完成！${backup.folders.length} 个收藏夹，${totalVideos} 个视频`, 'success');
      return backup;
    } catch (err: unknown) {
      logs.add(`备份失败: ${getErrorMessage(err)}`, 'error');
      return null;
    }
  });
}

/** 下载备份文件 */
export function downloadBackupFile(backup: BackupData): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const ts = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
  triggerDownload(blob, `bilibili-favorites-backup-${ts}.json`);
}

/** 读取用户上传的备份 JSON 文本 */
export function parseBackupFile(text: string): BackupData {
  const data = JSON.parse(text) as BackupData;
  if (!data || !Array.isArray(data.folders)) {
    throw new Error('备份文件格式不正确');
  }
  return data;
}

/**
 * 按备份文件恢复收藏夹：把每个视频移回备份时所在的收藏夹。
 * 仅处理仍存在、且当前不在目标收藏夹中的视频。
 */
export async function restoreFromBackup(
  backup: BackupData,
  biliData: BiliData,
  settings: Settings,
): Promise<{ moved: number; skipped: number }> {
  logs.add('开始按备份恢复收藏夹...', 'info');
  invalidateFolderCache();

  // 1. 确保备份中的收藏夹都存在
  const folders = await getAllFoldersWithIds(biliData);
  const titleToId = new Map<string, number>();
  for (const f of folders) titleToId.set(f.title, f.id);

  for (const f of backup.folders) {
    if (!titleToId.has(f.title)) {
      try {
        const id = await createFolder(f.title, biliData);
        titleToId.set(f.title, id);
      } catch (e: unknown) {
        logs.add(`创建「${f.title}」失败，跳过该分类: ${getErrorMessage(e)}`, 'warning');
      }
    }
  }

  // 2. 扫描当前所有视频所在位置 (记录 videoId → 当前收藏夹, 以及已存在集合)
  const location = new Map<number, number>();
  const present = new Set<string>();
  await scanAllFolderVideos<number>({
    biliData,
    fetchDelay: settings.fetchDelay,
    cancelCheck: () => get(cancelRequested),
    fetchFn: lightFetchJson,
    logPrefix: '恢复扫描',
    onVideo: (v, folder) => {
      location.set(v.id, folder.id);
      present.add(`${v.id}:${folder.id}`);
      return v.id;
    },
  });

  if (get(cancelRequested)) {
    logs.add('用户取消了恢复', 'warning');
    return { moved: 0, skipped: 0 };
  }

  // 3. 计算需要移动的条目
  const groups = new Map<string, { from: number; to: number; items: Array<{ id: number; type: number }> }>();
  let skipped = 0;

  for (const f of backup.folders) {
    const targetId = titleToId.get(f.title);
    if (!targetId) { skipped += f.videos.length; continue; }
    for (const v of f.videos) {
      if (present.has(`${v.id}:${targetId}`)) { skipped++; continue; } // 已在目标夹
      const cur = location.get(v.id);
      if (cur === undefined) { skipped++; continue; } // 视频已不存在(失效/删除)
      if (cur === targetId) { skipped++; continue; }
      const key = `${cur}->${targetId}`;
      if (!groups.has(key)) groups.set(key, { from: cur, to: targetId, items: [] });
      groups.get(key)!.items.push({ id: v.id, type: v.type ?? DEFAULT_VIDEO_TYPE });
    }
  }

  // 4. 执行移动
  const moveChunk = Math.max(1, settings.moveChunkSize);
  let moved = 0;
  for (const { from, to, items } of groups.values()) {
    if (get(cancelRequested)) break;
    for (let i = 0; i < items.length; i += moveChunk) {
      if (get(cancelRequested)) break;
      const chunk = items.slice(i, i + moveChunk);
      const resources = chunk.map((v) => `${v.id}:${v.type}`).join(',');
      const ok = await moveVideos(from, to, resources, biliData);
      if (ok) moved += chunk.length;
      await humanDelay(settings.writeDelay);
    }
  }

  logs.add(`恢复完成：移动 ${moved} 个视频，跳过 ${skipped} 个`, 'success');
  return { moved, skipped };
}
