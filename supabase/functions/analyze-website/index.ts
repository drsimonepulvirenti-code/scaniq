import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_AGENTS_CONFIG: Record<string, { name: string; prompt: string }> = {
  'ui-designer': {
    name: 'UI Designer',
    prompt: `You are an expert UI Designer analyzing a website. Focus on:
- Color usage, contrast, and palette harmony
- Typography choices, hierarchy, and readability
- Spacing, margins, padding, and visual rhythm
- Component design consistency
- Modern design trends and best practices
- Visual polish and attention to detail

Provide specific CSS values, color codes, and visual references.`
  },
  'ux-designer': {
    name: 'UX Designer', 
    prompt: `You are an expert UX Designer analyzing a website. Focus on:
- Navigation clarity and findability
- User flow optimization and friction points
- Form usability and error handling
- Feedback mechanisms and micro-interactions
- Cognitive load and information architecture
- User mental models and expectations

Provide user-centered recommendations with clear before/after scenarios.`
  },
  'seo-specialist': {
    name: 'SEO Specialist',
    prompt: `You are an expert SEO Specialist analyzing a website. Focus on:
- Meta tags (title, description, Open Graph)
- Heading structure and H1-H6 hierarchy
- Content quality, keyword usage, and readability
- Technical SEO (canonical URLs, structured data)
- Core Web Vitals impact on rankings
- Mobile-first indexing considerations

Provide specific SEO recommendations with priority based on impact.`
  },
  'accessibility-expert': {
    name: 'Accessibility Expert',
    prompt: `You are an expert Accessibility Specialist analyzing a website. Focus on:
- WCAG 2.1 AA/AAA compliance
- Color contrast ratios
- Screen reader compatibility and ARIA labels
- Keyboard navigation and focus states
- Motor accessibility and click targets
- Cognitive accessibility and clear language

Reference specific WCAG criteria and provide code examples.`
  },
  'performance-engineer': {
    name: 'Performance Engineer',
    prompt: `You are an expert Performance Engineer analyzing a website. Focus on:
- Core Web Vitals (LCP, FID/INP, CLS)
- Asset optimization (images, fonts, scripts)
- Network efficiency and request count
- Caching strategies and code splitting
- JavaScript execution and bundle size
- Mobile performance considerations

Provide measurable metrics and expected improvement percentages.`
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, enrichment, agentIds, websiteContent } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Lovable API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle agent enrichment requests
    if (enrichment && agentIds && Array.isArray(agentIds)) {
      console.log('Running agent enrichment for:', agentIds);
      
      const enrichments = [];
      
      for (const agentId of agentIds) {
        const agent = AI_AGENTS_CONFIG[agentId];
        if (!agent) continue;

        const enrichmentPrompt = `${agent.prompt}

Website URL: ${url}
Website Summary: ${websiteContent}

Analyze this website from your expert perspective and provide your response as a JSON object:
{
  "improvements": [
    {
      "id": "<unique-id>",
      "title": "<short title specific to your expertise>",
      "description": "<detailed description from your expert perspective>",
      "priority": "high" | "medium" | "low",
      "specificAdvice": "<very specific actionable advice with examples, code snippets, or exact values>",
      "estimatedImpact": <number 0-100 representing improvement potential>
    }
  ]
}

Provide 3-5 focused improvements from your area of expertise. Be very specific and actionable.

IMPORTANT: Return ONLY the JSON object, no additional text.`;

        try {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [{ role: 'user', content: enrichmentPrompt }],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content;
            
            if (content) {
              const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const parsed = JSON.parse(cleanContent);
              
              enrichments.push({
                agentId,
                agentName: agent.name,
                improvements: parsed.improvements || []
              });
            }
          }
        } catch (agentError) {
          console.error(`Error with agent ${agentId}:`, agentError);
        }
      }

      return new Response(
        JSON.stringify({ enrichments }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular analysis flow
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping website:', url);

    // Step 1: Scrape the website with Firecrawl including screenshot
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'screenshot'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Firecrawl error:', errorText);
      return new Response(
        JSON.stringify({ error: `Failed to fetch website: ${scrapeResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    
    if (!scrapeData.success) {
      return new Response(
        JSON.stringify({ error: scrapeData.error || 'Failed to scrape website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeData.data?.markdown || '';
    const screenshot = scrapeData.data?.screenshot || '';
    const metadata = scrapeData.data?.metadata || {};

    console.log('Website scraped successfully, analyzing with AI...');
    console.log('Screenshot available:', !!screenshot);

    // Step 2: Analyze with Lovable AI
    const analysisPrompt = `You are a UX/UI expert analyzing a website. Based on the following website content and metadata, provide a comprehensive analysis with specific improvement suggestions.

Website URL: ${url}
Website Title: ${metadata.title || 'Unknown'}
Website Description: ${metadata.description || 'None provided'}

Website Content:
${markdown.substring(0, 15000)}

Analyze this website and provide your response as a JSON object with this exact structure:
{
  "score": <number from 0-100 representing overall UX/UI quality>,
  "summary": "<2-3 sentence summary of the website's current UX/UI state>",
  "improvements": [
    {
      "id": "<unique-id>",
      "title": "<short title>",
      "description": "<detailed description of the issue>",
      "recommendation": "<specific actionable recommendation>",
      "priority": "high" | "medium" | "low",
      "category": "visual_design" | "usability" | "accessibility" | "performance",
      "estimatedBenefit": <number from 0-100 representing the estimated UX improvement impact if this issue is fixed>,
      "elementLocation": {
        "section": "<specific page section, e.g., 'Hero Section', 'Navigation Bar', 'Footer', 'Product Cards'>",
        "element": "<specific element, e.g., 'Main Headline', 'CTA Button', 'Search Input', 'Menu Links'>",
        "visualDescription": "<detailed description of what this element looks like and where exactly it is on the page>"
      }
    }
  ]
}

Guidelines for estimatedBenefit:
- 90-100: Critical fix that will dramatically improve user experience or conversions
- 70-89: High impact improvement that significantly enhances usability
- 50-69: Moderate improvement that will noticeably help users
- 30-49: Nice-to-have enhancement with some positive effect
- 0-29: Minor polish that provides subtle improvements

Provide 6-10 specific, actionable improvements across all categories. Be specific about what elements need improvement and why. For each issue, describe the EXACT element and its location so users can identify it on the page.

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI analysis error:', errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to analyze website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No analysis content received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI analysis received, parsing response...');

    // Parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add the screenshot and URL to the response
    const result = {
      ...analysis,
      screenshot,
      url,
      analyzedAt: new Date().toISOString(),
    };

    console.log('Analysis complete, returning results');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-website function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
