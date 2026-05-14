import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TowerSim — 建設業の原価・交渉シミュレーター",
    short_name: "TowerSim",
    description:
      "工務店・建設業の経営者・営業担当のための原価計算と単価交渉シミュレーター。総額提示案件・単価提案・受注可否判断をスマホでもPCでも。",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#F4EDDC",
    theme_color: "#2B3F66",
    lang: "ja",
    dir: "ltr",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "シミュレーターを開く",
        short_name: "シミュレーター",
        description: "原価・単価シミュレーターをすぐに開く",
        url: "/app",
      },
      {
        name: "プラン管理",
        short_name: "プラン",
        url: "/billing",
      },
    ],
  };
}
