import * as Updates from "expo-updates";

// Placeholder for EAS Update–driven question pack delivery.
// In MVP we ship JSON directly via require() in assetQuestionSource.
// When ready: call Updates.fetchUpdateAsync() and then reload.
export const packClient = {
  async checkForRemotePacks(): Promise<{ updated: boolean }> {
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        await Updates.fetchUpdateAsync();
        return { updated: true };
      }
    } catch {
      // dev builds without EAS Update enabled will throw — ignore
    }
    return { updated: false };
  },
  async applyUpdate(): Promise<void> {
    try {
      await Updates.reloadAsync();
    } catch {
      // ignore
    }
  },
};
