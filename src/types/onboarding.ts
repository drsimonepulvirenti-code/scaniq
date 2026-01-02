export interface ScrapedData {
  url: string;
  title: string;
  description: string;
  summary: string;
  targetAudience: string[];
  suggestedObjectives: string[];
  screenshot?: string;
  markdown?: string;
}

export interface CustomerPersona {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'b2b' | 'b2c';
}

export interface Objective {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface SelectedAgent {
  id: string;
  name: string;
  role: string;
  icon: string;
  expertise: string[];
}

export interface OnboardingData {
  url: string;
  scrapedData: ScrapedData | null;
  context: string;
  selectedPersonas: string[];
  selectedObjectives: string[];
  selectedAgents: string[];
  workEmail: string;
}

export interface CommentBalloon {
  id: string;
  x: number;
  y: number;
  agentId: string;
  agentName: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AgentInsight {
  id: string;
  agentId: string;
  agentName: string;
  agentIcon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  position?: { x: number; y: number };
}

export interface KnowledgeFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}
