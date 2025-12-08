import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Lovable API key not configured' }),
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
      "screenshotNote": "<description of what to look for in the screenshot that relates to this issue, e.g., 'Look at the navigation bar at the top' or 'Notice the button colors in the hero section'>"
    }
  ]
}

Provide 6-10 specific, actionable improvements across all categories. Be specific about what elements need improvement and why. For each issue, include a screenshotNote that describes where in the page screenshot the user can see this issue.

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
