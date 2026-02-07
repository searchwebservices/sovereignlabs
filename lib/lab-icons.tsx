import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Server,
  HardDrive,
  Watch,
  Speaker,
  Wifi,
  Printer,
  Camera,
  Bot,
  Cpu,
  Headphones,
  Gamepad2,
  Keyboard,
  Mouse,
  Glasses,
  CircuitBoard,
  Box,
  Plane,
  CircleDot,
  // Part category icons
  Activity,
  Cog,
  Plug,
  Battery,
  MemoryStick,
  Radio,
  Fan,
  Wrench,
  Lightbulb,
  Volume2,
  Mic,
  ToggleLeft,
  PlugZap,
  Focus,
  Package,
  Zap,
  Puzzle,
  Settings,
  type LucideIcon,
} from "lucide-react";

// ─── Device Types ────────────────────────────────────────────

export const DEVICE_TYPES = [
  { value: "smartphone", label: "Smartphone", icon: Smartphone },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "laptop", label: "Laptop", icon: Laptop },
  { value: "monitor", label: "Monitor", icon: Monitor },
  { value: "desktop", label: "Desktop / Tower", icon: Cpu },
  { value: "server", label: "Server", icon: Server },
  { value: "storage_drive", label: "Storage Drive", icon: HardDrive },
  { value: "smartwatch", label: "Smart Watch", icon: Watch },
  { value: "smart_ring", label: "Smart Ring", icon: CircleDot },
  { value: "smart_speaker", label: "Smart Speaker", icon: Speaker },
  { value: "router", label: "Router / Network", icon: Wifi },
  { value: "printer", label: "Printer", icon: Printer },
  { value: "camera", label: "Camera", icon: Camera },
  { value: "drone", label: "Drone", icon: Plane },
  { value: "robot", label: "Robot", icon: Bot },
  { value: "sensor_hub", label: "Sensor Hub", icon: Activity },
  { value: "microcontroller", label: "Microcontroller / Board", icon: CircuitBoard },
  { value: "vr_headset", label: "VR / AR Headset", icon: Glasses },
  { value: "keyboard", label: "Keyboard", icon: Keyboard },
  { value: "mouse", label: "Mouse", icon: Mouse },
  { value: "headphones", label: "Headphones", icon: Headphones },
  { value: "game_console", label: "Game Console", icon: Gamepad2 },
  { value: "other", label: "Other", icon: Box },
] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number]["value"];

const deviceTypeMap = new Map(
  DEVICE_TYPES.map((dt) => [dt.value, dt])
);

export function getDeviceTypeIcon(type: string | null | undefined): LucideIcon {
  return deviceTypeMap.get((type ?? "") as DeviceType)?.icon ?? Box;
}

export function getDeviceTypeLabel(type: string | null | undefined): string {
  return deviceTypeMap.get((type ?? "") as DeviceType)?.label ?? "Unknown";
}

// ─── Part Categories ─────────────────────────────────────────

export const PART_CATEGORIES = [
  { value: "sensor", label: "Sensor", icon: Activity },
  { value: "actuator", label: "Actuator / Motor", icon: Cog },
  { value: "cable", label: "Cable / Wire", icon: Plug },
  { value: "battery", label: "Battery / Power Cell", icon: Battery },
  { value: "circuit_board", label: "Circuit Board / PCB", icon: CircuitBoard },
  { value: "processor", label: "Processor / Chip", icon: Cpu },
  { value: "memory", label: "Memory / Storage", icon: MemoryStick },
  { value: "display", label: "Display / Screen", icon: Monitor },
  { value: "camera_module", label: "Camera Module", icon: Camera },
  { value: "antenna", label: "Antenna / Radio", icon: Radio },
  { value: "cooling", label: "Fan / Cooling", icon: Fan },
  { value: "frame", label: "Frame / Chassis", icon: Box },
  { value: "fastener", label: "Fastener / Hardware", icon: Wrench },
  { value: "led", label: "LED / Light", icon: Lightbulb },
  { value: "speaker", label: "Speaker / Audio", icon: Volume2 },
  { value: "microphone", label: "Microphone", icon: Mic },
  { value: "switch", label: "Button / Switch", icon: ToggleLeft },
  { value: "power_supply", label: "Power Supply / PSU", icon: PlugZap },
  { value: "connector", label: "Connector / Port", icon: Settings },
  { value: "optics", label: "Lens / Optics", icon: Focus },
  { value: "enclosure", label: "Enclosure / Case", icon: Package },
  { value: "resistor", label: "Resistor / Capacitor", icon: Zap },
  { value: "gear", label: "Gear / Mechanical", icon: Cog },
  { value: "other", label: "Other", icon: Puzzle },
] as const;

export type PartCategory = (typeof PART_CATEGORIES)[number]["value"];

const partCategoryMap = new Map(
  PART_CATEGORIES.map((pc) => [pc.value, pc])
);

export function getPartCategoryIcon(category: string | null | undefined): LucideIcon {
  return partCategoryMap.get((category ?? "") as PartCategory)?.icon ?? Puzzle;
}

export function getPartCategoryLabel(category: string | null | undefined): string {
  return partCategoryMap.get((category ?? "") as PartCategory)?.label ?? "Uncategorized";
}
