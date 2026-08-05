/**
 * P3.2 presentation elevation — maps UI nav L1 to taxonomy slugs.
 * Does not invent taxonomy nodes; resolves against live tree when possible.
 */

export type NavElevationSpec = {
  id: string;
  label: string;
  /** Preferred hub slug (L1 or L2 in taxonomy). */
  anchorSlug: string;
  /** Optional L2 sections to surface first when present under anchor. */
  preferL2?: string[];
  /** Leaf shortcuts always offered if found anywhere in tree. */
  leafShortcuts?: string[];
  /** Featured brand query links (never as categories). */
  brands?: { label: string; brand: string }[];
};

export const NAV_ELEVATION: NavElevationSpec[] = [
  {
    id: "computadores",
    label: "Computadores",
    anchorSlug: "informatica",
    preferL2: ["computadores", "monitores", "armazenamento", "perifericos", "redes"],
    leafShortcuts: [
      "laptop",
      "desktop",
      "mini_pc",
      "monitor",
      "ssd",
      "external_ssd",
      "ram",
      "docking_station",
    ],
    brands: [
      { label: "Apple", brand: "apple" },
      { label: "ASUS", brand: "asus" },
      { label: "Lenovo", brand: "lenovo" },
      { label: "HP", brand: "hp" },
    ],
  },
  {
    id: "componentes",
    label: "Componentes",
    anchorSlug: "componentes",
    leafShortcuts: [
      "gpu",
      "cpu",
      "motherboard",
      "ram",
      "ssd",
      "hdd",
      "psu",
      "cooler",
      "pc_case",
    ],
    brands: [
      { label: "ASUS", brand: "asus" },
      { label: "MSI", brand: "msi" },
      { label: "Kingston", brand: "kingston" },
      { label: "Samsung", brand: "samsung" },
    ],
  },
  {
    id: "telemoveis",
    label: "Telemóveis",
    anchorSlug: "telemoveis",
    preferL2: ["dispositivos", "acessorios"],
    leafShortcuts: [
      "smartphone",
      "tablet",
      "ebook_reader",
      "phone_case",
      "screen_protector",
      "charger",
      "power_bank",
      "cable",
    ],
    brands: [
      { label: "Apple", brand: "apple" },
      { label: "Samsung", brand: "samsung" },
      { label: "Xiaomi", brand: "xiaomi" },
      { label: "Google", brand: "google" },
    ],
  },
  {
    id: "wearables",
    label: "Wearables",
    anchorSlug: "wearables",
    leafShortcuts: [
      "smartwatch",
      "fitness_tracker",
      "wearable_band",
      "smart_ring",
      "item_tracker",
    ],
    brands: [
      { label: "Apple", brand: "apple" },
      { label: "Garmin", brand: "garmin" },
      { label: "Huawei", brand: "huawei" },
      { label: "Samsung", brand: "samsung" },
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    anchorSlug: "gaming",
    leafShortcuts: [
      "console",
      "handheld_console",
      "vr_headset",
      "game_physical",
      "controller",
      "gaming_chair",
    ],
    brands: [
      { label: "Sony", brand: "sony" },
      { label: "Microsoft", brand: "microsoft" },
      { label: "Nintendo", brand: "nintendo" },
    ],
  },
  {
    id: "tv_audio",
    label: "TV e Áudio",
    anchorSlug: "tv_audio",
    leafShortcuts: ["tv", "soundbar", "headphones", "speakers", "projector"],
    brands: [
      { label: "Samsung", brand: "samsung" },
      { label: "LG", brand: "lg" },
      { label: "Sony", brand: "sony" },
      { label: "Bose", brand: "bose" },
    ],
  },
  {
    id: "fotografia",
    label: "Fotografia",
    anchorSlug: "fotografia",
    leafShortcuts: ["camera", "action_cam", "lens", "drone", "gimbal"],
    brands: [
      { label: "DJI", brand: "dji" },
      { label: "Sony", brand: "sony" },
      { label: "Canon", brand: "canon" },
      { label: "GoPro", brand: "gopro" },
    ],
  },
  {
    id: "smart_home",
    label: "Casa Inteligente",
    anchorSlug: "smart_home",
    leafShortcuts: [
      "security_camera",
      "smart_plug",
      "smart_bulb",
      "smart_lock",
    ],
    brands: [
      { label: "TP-Link", brand: "tp-link" },
      { label: "Xiaomi", brand: "xiaomi" },
      { label: "Google", brand: "google" },
      { label: "Amazon", brand: "amazon" },
    ],
  },
  {
    id: "casa",
    label: "Casa & Eletro",
    anchorSlug: "casa",
    preferL2: ["cozinha", "limpeza", "grandes_eletro", "clima"],
    leafShortcuts: [
      "air_fryer",
      "coffee_machine",
      "cookware",
      "vacuum",
      "robot_vacuum",
      "iron",
      "climate_appliance",
    ],
    brands: [
      { label: "Tefal", brand: "tefal" },
      { label: "Philips", brand: "philips" },
      { label: "Dyson", brand: "dyson" },
      { label: "Bosch", brand: "bosch" },
    ],
  },
  {
    id: "desporto",
    label: "Desporto",
    anchorSlug: "desporto",
    leafShortcuts: ["padel_gear", "padel_apparel"],
    brands: [
      { label: "Bullpadel", brand: "bullpadel" },
      { label: "NOX", brand: "nox" },
      { label: "Adidas", brand: "adidas" },
    ],
  },
];

export const POPULAR_LEAF_FALLBACK = [
  "smartphone",
  "laptop",
  "ssd",
  "gpu",
  "smartwatch",
  "security_camera",
  "padel_gear",
  "air_fryer",
] as const;

/** Extra SSG slugs for elevated / v1.2 leaves (FE only). */
export const P32_EXTRA_STATIC_SLUGS = [
  "wearables",
  "smart_home",
  "desporto",
  "raquetes",
  "padel_gear",
  "padel_apparel",
  "security_camera",
  "smart_plug",
  "smart_bulb",
  "smart_lock",
  "smart_ring",
  "item_tracker",
  "cookware",
  "iron",
  "laptop_bag",
  "gimbal",
  "camera_filter",
  "camera_bag",
  "drones",
  "drone",
  "drone_accessory",
  "cozinha_utensilios",
  "cuidado_roupa",
] as const;
