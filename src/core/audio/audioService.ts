import { createAudioPlayer, AudioPlayer } from "expo-audio";

import { SfxName, sfxAssetPaths } from "./sfxLibrary";

type LoadedSfx = { player: AudioPlayer };

class AudioService {
  private sfxPlayers: Partial<Record<SfxName, LoadedSfx>> = {};
  private bgmPlayer: AudioPlayer | null = null;
  private bgmVolume = 0.5;

  async playSfx(name: SfxName, volume: number): Promise<void> {
    const asset = sfxAssetPaths[name];
    if (asset == null) {
      // Asset not bundled yet — SFX layer is plumbed but silent.
      return;
    }
    try {
      let entry = this.sfxPlayers[name];
      if (!entry) {
        const player = createAudioPlayer(asset);
        entry = { player };
        this.sfxPlayers[name] = entry;
      }
      entry.player.volume = volume;
      await entry.player.seekTo(0);
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
