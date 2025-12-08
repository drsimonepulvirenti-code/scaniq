export type Priority = 'high' | 'medium' | 'low';
export type Category = 'visual_design' | 'usability' | 'accessibility' | 'performance';

export interface ElementLocation {
  section: string;
  element: string;
  visualDescription: string;
}

export interface Improvement {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  priority: Priority;
  category: Category;
  estimatedBenefit: number;
  elementLocation: ElementLocation;
}

export interface AnalysisResult {
  summary: string;
  score: number;
  improvements: Improvement[];
  screenshot?: string;
  url: string;
  analyzedAt: string;
}

export interface CategoryInfo {
  id: Category;
  label: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { 
    id: 'visual_design', 
    label: 'Visual Design', 
    icon: '🎨',
    colorClass: 'text-coral',
    bgClass: 'bg-coral/10 border-coral/30',
  },
  { 
    id: 'usability', 
    label: 'Usability', 
    icon: '🧭',
    colorClass: 'text-electric',
    bgClass: 'bg-electric/10 border-electric/30',
  },
  { 
    id: 'accessibility', 
    label: 'Accessibility', 
    icon: '♿',
    colorClass: 'text-sunny',
    bgClass: 'bg-sunny/10 border-sunny/30',
  },
  { 
    id: 'performance', 
    label: 'Performance', 
    icon: '⚡',
    colorClass: 'text-teal',
    bgClass: 'bg-teal/10 border-teal/30',
  },
];

export const PRIORITY_CONFIG = {
  high: { label: 'High Priority', colorClass: 'bg-coral text-primary-foreground' },
  medium: { label: 'Medium Priority', colorClass: 'bg-electric text-primary-foreground' },
  low: { label: 'Low Priority', colorClass: 'bg-teal text-primary-foreground' },
};

export const SCORE_DESCRIPTIONS = {
  excellent: { 
    label: 'Excellent', 
    description: 'Outstanding UX/UI! The website follows best practices with minimal issues.',
    colorClass: 'text-teal'
  },
  good: { 
    label: 'Good', 
    description: 'Solid foundation with room for improvement. Address high-priority issues first.',
    colorClass: 'text-electric'
  },
  average: { 
    label: 'Average', 
    description: 'Several areas need attention. Focus on usability and visual consistency.',
    colorClass: 'text-sunny'
  },
  needsWork: { 
    label: 'Needs Work', 
    description: 'Significant improvements required. Prioritize accessibility and core usability.',
    colorClass: 'text-coral'
  },
  poor: { 
    label: 'Poor', 
    description: 'Major UX/UI overhaul recommended. Consider a comprehensive redesign.',
    colorClass: 'text-coral'
  },
};

export function getScoreCategory(score: number) {
  if (score >= 85) return SCORE_DESCRIPTIONS.excellent;
  if (score >= 70) return SCORE_DESCRIPTIONS.good;
  if (score >= 50) return SCORE_DESCRIPTIONS.average;
  if (score >= 30) return SCORE_DESCRIPTIONS.needsWork;
  return SCORE_DESCRIPTIONS.poor;
}
