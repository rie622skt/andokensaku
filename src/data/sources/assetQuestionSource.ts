import {
  ComparePack,
  Panel9Pack,
  SpeedPack,
  StairsPack,
} from "@/data/models";

// Bundled JSON packs. The `require` calls are resolved by Metro at bundle
// time, so the JSON ships inside the app and is available offline from
// first launch.
//
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const compareJson = require("@assets/data/packs/compare_v1.json");
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const speedJson = require("@assets/data/packs/speed_v1.json");
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const panel9Json = require("@assets/data/packs/panel9_v1.json");
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const stairsJson = require("@assets/data/packs/stairs_v1.json");

export const assetQuestionSource = {
  loadComparePack: (): ComparePack => ComparePack.parse(compareJson),
  loadSpeedPack: (): SpeedPack => SpeedPack.parse(speedJson),
  loadPanel9Pack: (): Panel9Pack => Panel9Pack.parse(panel9Json),
  loadStairsPack: (): StairsPack => StairsPack.parse(stairsJson),
};
