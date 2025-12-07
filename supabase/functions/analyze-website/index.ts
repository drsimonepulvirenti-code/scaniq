import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteContent, url } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing website:", url);
    console.log("Content length:", websiteContent?.length || 0);

    const systemPrompt = `You are an expert UX/UI analyst. Analyze the provided website content and generate comprehensive improvement suggestions.

For each issue found, provide:
1. A clear, actionable title
2. A brief description of the problem
3. A recommended fix
4. Priority level (high, medium, or low)
5. Category (visual_design, usability, accessibility, or performance)

Respond with a JSON object in this exact format:
{
  "summary": "Brief overall assessment of the website (2-3 sentences)",
  "score": <number 1-100 representing overall UX/UI quality>,
  "improvements": [
    {
      "id": "<unique-id>",
      "title": "<issue title>",
      "description": "<problem description>",
      "recommendation": "<how to fix it>",
      "priority": "high" | "medium" | "low",
      "category": "visual_design" | "usability" | "accessibility" | "performance"
    }
  ]
}

Categories explained:
- visual_design: Colors, typography, spacing, layout, visual hierarchy
- usability: Navigation, user flows, CTAs, forms, content clarity
- accessibility: Screen reader support, color contrast, keyboard navigation, alt text
- performance: Load times, mobile responsiveness, image optimization

Analyze thoroughly and provide 8-15 actionable improvements across all categories.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this website (${url}):\n\n${websiteContent?.slice(0, 15000) || "No content available"}` 
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response received, parsing...");

    // Parse the JSON from the response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw content:", content);
      throw new Error("Failed to parse analysis results");
    }

    console.log("Analysis complete:", analysis.improvements?.length, "improvements found");

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-website function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
