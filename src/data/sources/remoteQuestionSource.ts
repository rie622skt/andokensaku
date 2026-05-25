// Placeholder for OTA-delivered packs. With EAS Update enabled, JS bundle
// (including require()d JSON) is replaced atomically, so the existing
// assetQuestionSource already covers OTA. This file exists for the case
// where we move to a true CDN-hosted JSON later (signed URL + checksum).

export const remoteQuestionSource = {
  async fetchPack(_packId: string): Promise<unknown> {
    throw new Error("remoteQuestionSource not implemented yet (post-MVP)");
  },
};
