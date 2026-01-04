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
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let markdown = '';
    let title = '';
    let description = '';

    // Try Firecrawl first
    if (FIRECRAWL_API_KEY) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        if (scrapeData.success && scrapeData.data) {
          markdown = scrapeData.data.markdown || '';
          title = scrapeData.data.metadata?.title || '';
          description = scrapeData.data.metadata?.description || '';
        }
      } catch (e) {
        console.error('Firecrawl error:', e);
      }
    }

    // Fallback: fetch basic info
    if (!markdown) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        title = titleMatch?.[1] || '';
        description = descMatch?.[1] || '';
        markdown = `# ${title}\n\n${description}`;
      } catch (e) {
        console.error('Fetch error:', e);
      }
    }

    // Use AI to analyze content
    let summary = description;
    let targetAudience: string[] = [];
    let suggestedObjectives: string[] = [];

    if (LOVABLE_API_KEY && markdown) {
      try {
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
                role: 'system',
                content: 'Analyze website content. Return JSON with: summary (2-3 sentences), targetAudience (array of 2-4 audience types), suggestedObjectives (array of 2-4 business goals). Only return valid JSON.',
              },
              { role: 'user', content: `Analyze: ${markdown.slice(0, 3000)}` },
            ],
          }),
        });

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          summary = parsed.summary || summary;
          targetAudience = parsed.targetAudience || [];
          suggestedObjectives = parsed.suggestedObjectives || [];
        }
      } catch (e) {
        console.error('AI analysis error:', e);
      }
    }

    return new Response(JSON.stringify({
      title,
      description,
      summary,
      targetAudience,
      suggestedObjectives,
      markdown: markdown.slice(0, 5000),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
