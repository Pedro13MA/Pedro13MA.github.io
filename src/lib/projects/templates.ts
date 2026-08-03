/**
 * FASE 7.13 — templates = só slots iniciais (sem marcas/modelos).
 */

import type { ProjectTemplate } from "@/lib/projects/types";

const PC_SLOTS = [
  { id: "cpu", label: "CPU", compatibilityHints: ["socket"] },
  { id: "motherboard", label: "Motherboard", compatibilityHints: ["socket", "form_factor"] },
  { id: "ram", label: "RAM", compatibilityHints: ["ddr", "speed"] },
  { id: "gpu", label: "GPU", compatibilityHints: ["pcie"] },
  { id: "ssd", label: "SSD", compatibilityHints: ["nvme"] },
  { id: "psu", label: "Fonte", compatibilityHints: ["wattage", "atx"] },
  { id: "cooler", label: "Cooler", compatibilityHints: ["socket", "tdp"] },
  { id: "case", label: "Caixa", compatibilityHints: ["form_factor"] },
  { id: "monitor", label: "Monitor" },
  { id: "keyboard", label: "Teclado" },
  { id: "mouse", label: "Rato" },
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "blank",
    name: "Em branco",
    description: "Projeto livre — adicione slots e produtos à medida.",
    slots: [{ id: "item_1", label: "Item 1" }],
  },
  {
    id: "pc_gaming",
    name: "PC Gaming",
    description: "Estrutura para um PC de jogo — sem impor marcas.",
    slots: PC_SLOTS,
  },
  {
    id: "pc_work",
    name: "PC Trabalho",
    description: "Estação de trabalho produtiva.",
    slots: [
      { id: "cpu", label: "CPU", compatibilityHints: ["socket"] },
      { id: "motherboard", label: "Motherboard", compatibilityHints: ["socket"] },
      { id: "ram", label: "RAM" },
      { id: "ssd", label: "SSD" },
      { id: "gpu", label: "GPU (opcional)" },
      { id: "psu", label: "Fonte" },
      { id: "case", label: "Caixa" },
      { id: "monitor", label: "Monitor" },
      { id: "keyboard", label: "Teclado" },
      { id: "mouse", label: "Rato" },
    ],
  },
  {
    id: "streaming",
    name: "Setup Streaming",
    description: "PC + captura + áudio para stream.",
    slots: [
      { id: "cpu", label: "CPU" },
      { id: "gpu", label: "GPU" },
      { id: "ram", label: "RAM" },
      { id: "ssd", label: "SSD" },
      { id: "motherboard", label: "Motherboard" },
      { id: "psu", label: "Fonte" },
      { id: "case", label: "Caixa" },
      { id: "mic", label: "Microfone" },
      { id: "camera", label: "Câmara" },
      { id: "headset", label: "Headset" },
      { id: "light", label: "Iluminação" },
    ],
  },
  {
    id: "home_office",
    name: "Home Office",
    description: "Escritório em casa completo.",
    slots: [
      { id: "laptop_or_pc", label: "Portátil / PC" },
      { id: "monitor", label: "Monitor" },
      { id: "keyboard", label: "Teclado" },
      { id: "mouse", label: "Rato" },
      { id: "headset", label: "Headset" },
      { id: "webcam", label: "Webcam" },
      { id: "chair", label: "Cadeira" },
      { id: "desk_lamp", label: "Iluminação" },
    ],
  },
  {
    id: "nas",
    name: "NAS",
    description: "Armazenamento em rede e discos.",
    slots: [
      { id: "nas_unit", label: "Unidade NAS" },
      { id: "hdd_1", label: "Disco 1" },
      { id: "hdd_2", label: "Disco 2" },
      { id: "hdd_3", label: "Disco 3" },
      { id: "hdd_4", label: "Disco 4" },
      { id: "ssd_cache", label: "SSD cache (opcional)" },
      { id: "ups", label: "UPS (opcional)" },
    ],
  },
  {
    id: "photography",
    name: "Fotografia",
    description: "Corpo, lentes e acessórios.",
    slots: [
      { id: "body", label: "Corpo" },
      { id: "lens_1", label: "Objetiva 1" },
      { id: "lens_2", label: "Objetiva 2" },
      { id: "tripod", label: "Tripé" },
      { id: "card", label: "Cartão memória" },
      { id: "bag", label: "Mala" },
      { id: "light", label: "Iluminação" },
    ],
  },
  {
    id: "smart_home",
    name: "Smart Home",
    description: "Casa inteligente — hubs e sensores.",
    slots: [
      { id: "hub", label: "Hub / Bridge" },
      { id: "bulb", label: "Iluminação" },
      { id: "plug", label: "Tomadas smart" },
      { id: "camera", label: "Câmara" },
      { id: "thermostat", label: "Termóstato" },
      { id: "sensor", label: "Sensores" },
      { id: "speaker", label: "Coluna" },
    ],
  },
];

export function getTemplate(id: string): ProjectTemplate {
  return (
    PROJECT_TEMPLATES.find((t) => t.id === id) || PROJECT_TEMPLATES[0]
  );
}
