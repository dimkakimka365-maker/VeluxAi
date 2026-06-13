export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: string; // Base64 encoding of image if any
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  presetId: string;
  searchGroundingEnabled: boolean;
  createdAt: Date;
}

export interface SystemPreset {
  id: string;
  name: string;
  description: string;
  instruction: string;
  iconName: string; // lucide icon name representation
}
