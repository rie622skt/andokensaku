import { createAudioPlayer, AudioPlayer } from "expo-audio";

import { SfxName, sfxAssetPaths } from "./sfxLibrary";

type LoadedSfx = { player: AudioPlayer };

class AudioService {
  private sfxPlayers: Partial<Record<SfxName, LoadedSfx>> = {};
  private bgmPlayer: AudioPlayer | null = null;
  private bgmVolume = 0.5;

  /**
   * Create (and start loading) every bundled SFX player ahead of time so the
   * first play has no load latency. Safe to call before any user gesture —
   * only playback needs a gesture, not loading.
   */
  preloadSfx(): void {
    for (const name of Object.keys(sfxAssetPaths) as SfxName[]) {
      const asset = sfxAssetPaths[name];
      if (asset == null || this.sfxPlayers[name]) continue;
      try {
        this.sfxPlayers[name] = { player: createAudioPlayer(asset) };
      } catch {
        // best-effort
      }
    }
  }

  playSfx(name: SfxName, volume: number): void {
    const asset = sfxAssetPaths[name];
    if (asset == null) {
      // Asset not bundled yet — SFX layer is plumbed but silent.
      return;
    }
    try {
      let entry = this.sfxPlayers[name];
      if (!entry) {
        entry = { player: createAudioPlayer(asset) };
        this.sfxPlayers[name] = entry;
      }
      entry.player.volume = volume;
      // Restart from the beginning without awaiting (lowest latency).
      void entry.player.seekTo(0);
      entry.player.play();
    } catch {
      // best-effort
    }
  }

  async playBgm(asset: number, volume: number): Promise<void> {
    try {
      if (this.bgmPlayer) {
        this.bgmPlayer.pause();
        this.bgmPlayer.remove();
      }
      this.bgmPlayer = createAudioPlayer(asset);
      this.bgmPlayer.loop = true;
      this.bgmPlayer.volume = volume;
      this.bgmVolume = volume;
      this.bgmPlayer.play();
    } catch {
      // best-effort
    }
  }

  setBgmVolume(volume: number): void {
    this.bgmVolume = volume;
    if (this.bgmPlayer) this.bgmPlayer.volume = volume;
  }

  stopBgm(): void {
    if (this.bgmPlayer) {
      this.bgmPlayer.pause();
      this.bgmPlayer.remove();
      this.bgmPlayer = null;
    }
  }

  pauseBgm(): void {
    this.bgmPlayer?.pause();
  }

  resumeBgm(): void {
    this.bgmPlayer?.play();
  }
}

export const audioService = new AudioService();
