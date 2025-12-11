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
    colorClass: 'text-brand-purple',
    bgClass: 'bg-[hsl(262,83%,95%)] border-[hsl(262,83%,80%)]',
  },
  { 
    id: 'usability', 
    label: 'Usability', 
    icon: '🧭',
    colorClass: 'text-primary',
    bgClass: 'bg-[hsl(217,91%,95%)] border-[hsl(217,91%,80%)]',
  },
  { 
    id: 'accessibility', 
    label: 'Accessibility', 
    icon: '♿',
    colorClass: 'text-brand-orange',
    bgClass: 'bg-[hsl(25,95%,95%)] border-[hsl(25,95%,80%)]',
  },
  { 
    id: 'performance', 
    label: 'Performance', 
    icon: '⚡',
    colorClass: 'text-brand-green',
    bgClass: 'bg-[hsl(160,84%,95%)] border-[hsl(160,84%,80%)]',
  },
];

export const PRIORITY_CONFIG = {
  high: { label: 'High Priority', colorClass: 'bg-destructive text-destructive-foreground' },
  medium: { label: 'Medium Priority', colorClass: 'bg-primary text-primary-foreground' },
  low: { label: 'Low Priority', colorClass: 'bg-brand-green text-primary-foreground' },
};

export const SCORE_DESCRIPTIONS = {
  excellent: { 
    label: 'Excellent', 
    description: 'Outstanding UX/UI! The website follows best practices with minimal issues.',
    colorClass: 'text-brand-green'
  },
  good: { 
    label: 'Good', 
    description: 'Solid foundation with room for improvement. Address high-priority issues first.',
    colorClass: 'text-primary'
  },
  average: { 
    label: 'Average', 
    description: 'Several areas need attention. Focus on usability and visual consistency.',
    colorClass: 'text-brand-orange'
  },
  needsWork: { 
    label: 'Needs Work', 
    description: 'Significant improvements required. Prioritize accessibility and core usability.',
    colorClass: 'text-destructive'
  },
  poor: { 
    label: 'Poor', 
    description: 'Major UX/UI overhaul recommended. Consider a comprehensive redesign.',
    colorClass: 'text-destructive'
  },
};

export function getScoreCategory(score: number) {
  if (score >= 85) return SCORE_DESCRIPTIONS.excellent;
  if (score >= 70) return SCORE_DESCRIPTIONS.good;
  if (score >= 50) return SCORE_DESCRIPTIONS.average;
  if (score >= 30) return SCORE_DESCRIPTIONS.needsWork;
  return SCORE_DESCRIPTIONS.poor;
}
