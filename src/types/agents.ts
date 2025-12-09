export interface AIAgent {
  id: string;
  name: string;
  role: string;
  icon: string;
  description: string;
  expertiseAreas: string[];
  analysisPrompt: string;
}

export interface AgentEnrichment {
  agentId: string;
  agentName: string;
  improvements: AgentImprovement[];
}

export interface AgentImprovement {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  specificAdvice: string;
  estimatedImpact: number;
}

export const AI_AGENTS: AIAgent[] = [
  {
    id: 'ui-designer',
    name: 'UI Designer',
    role: 'Visual Interface Expert',
    icon: '🎨',
    description: 'Focuses on aesthetics, visual hierarchy, and brand consistency',
    expertiseAreas: ['Color Theory', 'Typography', 'Visual Hierarchy', 'Component Design'],
    analysisPrompt: 'Analyze this website from a UI design perspective. Focus on color usage, typography, spacing, visual consistency, and modern design trends. Provide specific CSS values and color codes.'
  },
  {
    id: 'ux-designer',
    name: 'UX Designer',
    role: 'User Experience Expert',
    icon: '🧠',
    description: 'Focuses on usability, user flows, and interaction design',
    expertiseAreas: ['User Journeys', 'Information Architecture', 'Interaction Patterns', 'Cognitive Load'],
    analysisPrompt: 'Analyze this website from a UX perspective. Focus on navigation clarity, user flows, form usability, feedback mechanisms, and cognitive load. Provide user-centered recommendations.'
  },
  {
    id: 'seo-specialist',
    name: 'SEO Specialist',
    role: 'Search Optimization Expert',
    icon: '🔍',
    description: 'Focuses on visibility, rankings, and organic traffic optimization',
    expertiseAreas: ['On-page SEO', 'Technical SEO', 'Content Optimization', 'Core Web Vitals'],
    analysisPrompt: 'Analyze this website from an SEO perspective. Focus on meta tags, heading structure, content quality, technical SEO, and performance impact on rankings. Provide specific optimization recommendations.'
  },
  {
    id: 'accessibility-expert',
    name: 'Accessibility Expert',
    role: 'Inclusive Design Specialist',
    icon: '♿',
    description: 'Ensures inclusive design for users with disabilities',
    expertiseAreas: ['WCAG Compliance', 'Screen Readers', 'Keyboard Navigation', 'Color Contrast'],
    analysisPrompt: 'Analyze this website from an accessibility perspective. Focus on WCAG 2.1 compliance, screen reader compatibility, keyboard navigation, color contrast, and ARIA implementation. Reference specific WCAG criteria.'
  },
  {
    id: 'performance-engineer',
    name: 'Performance Engineer',
    role: 'Speed & Efficiency Expert',
    icon: '⚡',
    description: 'Focuses on speed, efficiency, and Core Web Vitals',
    expertiseAreas: ['Core Web Vitals', 'Asset Optimization', 'Caching', 'Code Splitting'],
    analysisPrompt: 'Analyze this website from a performance perspective. Focus on Core Web Vitals (LCP, FID, CLS), asset optimization, network efficiency, and loading strategies. Provide measurable improvement targets.'
  }
];
