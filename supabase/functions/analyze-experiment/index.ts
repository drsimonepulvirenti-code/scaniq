import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExperimentIssue {
  id: string;
  element_name: string;
  approximate_location: string;
  description: string;
  kb_rule_reference: string;
  severity: 'error' | 'warning' | 'info';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth header for Supabase
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Retrieve KB rules if user is authenticated
    let kbRules: string[] = [];
    if (userId) {
      const { data: chunks } = await supabase
        .from('knowledge_chunks')
        .select(`
          content,
          knowledge_documents!inner(user_id, is_active, document_type)
        `)
        .eq('knowledge_documents.user_id', userId)
        .eq('knowledge_documents.is_active', true);

      if (chunks && chunks.length > 0) {
        // Extract rules from KB chunks, prioritizing guidelines and brand documents
        kbRules = chunks.slice(0, 20).map((c: any) => c.content);
      }
    }

    const kbContext = kbRules.length > 0 
      ? `\n\nKnowledge Base Rules to check against:\n${kbRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      : '\n\nNo Knowledge Base rules available. Analyze based on general UX/UI best practices.';

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use Gemini for vision analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a UX/UI compliance analyst. Analyze experiment screenshots for potential issues against Knowledge Base rules and best practices.

For each issue found, provide:
- element_name: The UI element with the issue (e.g., "Submit Button", "Header Text", "Form Field")
- approximate_location: Where on screen (e.g., "top-right", "center", "below navigation", "bottom-left")
- description: Brief explanation of the issue
- kb_rule_reference: Which KB rule is violated, or "General UX Best Practice" if no specific rule
- severity: "error" for critical issues, "warning" for moderate issues, "info" for suggestions

Be specific and actionable. Focus on real issues, not minor nitpicks.
If no significant issues are found, return an empty array.

Respond ONLY with valid JSON in this format:
{
  "issues": [
    {
      "id": "unique-id",
      "element_name": "Element Name",
      "approximate_location": "location description",
      "description": "Issue description",
      "kb_rule_reference": "Rule reference or best practice",
      "severity": "error|warning|info"
    }
  ],
  "summary": "Brief overall assessment"
}${kbContext}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this experiment screenshot for UI/UX compliance issues. Check against the Knowledge Base rules and identify any potential problems.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/png'};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Parse JSON response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { issues: [], summary: 'Unable to parse response' };
      }
    } catch {
      console.error('Failed to parse AI response:', content);
      result = { issues: [], summary: 'Analysis completed but response parsing failed' };
    }

    // Add unique IDs if missing
    result.issues = (result.issues || []).map((issue: any, index: number) => ({
      ...issue,
      id: issue.id || `issue-${index + 1}`
    }));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('analyze-experiment error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
