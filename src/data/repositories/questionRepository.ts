import {
  ComparePack,
  Panel9Pack,
  SpeedPack,
  StairsPack,
} from "@/data/models";
import { assetQuestionSource } from "@/data/sources/assetQuestionSource";

class QuestionRepository {
  private comparePack: ComparePack | null = null;
  private speedPack: SpeedPack | null = null;
  private panel9Pack: Panel9Pack | null = null;
  private stairsPack: StairsPack | null = null;

  getComparePack(): ComparePack {
    this.comparePack ??= assetQuestionSource.loadComparePack();
    return this.comparePack;
  }

  getSpeedPack(): SpeedPack {
    this.speedPack ??= assetQuestionSource.loadSpeedPack();
    return this.speedPack;
  }

  getPanel9Pack(): Panel9Pack {
    this.panel9Pack ??= assetQuestionSource.loadPanel9Pack();
    return this.panel9Pack;
  }

  getStairsPack(): StairsPack {
    this.stairsPack ??= assetQuestionSource.loadStairsPack();
    return this.stairsPack;
  }

  invalidateAll(): void {
    this.comparePack = null;
    this.speedPack = null;
    this.panel9Pack = null;
    this.stairsPack = null;
  }
}

export const questionRepository = new QuestionRepository();
