import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple keyword-based search (no embeddings required)
function scoreChunkRelevance(chunk: string, query: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const chunkLower = chunk.toLowerCase();
  
  let score = 0;
  for (const word of queryWords) {
    // Count occurrences
    const regex = new RegExp(word, 'gi');
    const matches = chunkLower.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  
  // Normalize by query length
  return queryWords.length > 0 ? score / queryWords.length : 0;
}

// Find relevant chunks using keyword matching
async function findRelevantChunks(
  supabase: any, 
  query: string, 
  userId: string,
  limit = 5
) {
  // Get all active documents for this user
  const { data: docs, error: docsError } = await supabase
    .from('knowledge_documents')
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('processing_status', 'completed');

  if (docsError || !docs?.length) {
    console.log("No active documents found");
    return [];
  }

  const docIds = docs.map((d: any) => d.id);
  const docMap = Object.fromEntries(docs.map((d: any) => [d.id, d.name]));

  // Get all chunks for these documents
  const { data: chunks, error: chunksError } = await supabase
    .from('knowledge_chunks')
    .select('id, document_id, content, chunk_index')
    .in('document_id', docIds);

  if (chunksError || !chunks?.length) {
    console.log("No chunks found");
    return [];
  }

  // Score each chunk
  const scoredChunks = chunks.map((chunk: any) => ({
    id: chunk.id,
    document_id: chunk.document_id,
    document_name: docMap[chunk.document_id],
    content: chunk.content,
    chunk_index: chunk.chunk_index,
    score: scoreChunkRelevance(chunk.content, query),
  })).filter((c: any) => c.score > 0);

  // Sort by score and return top results
  scoredChunks.sort((a: any, b: any) => b.score - a.score);
  return scoredChunks.slice(0, limit);
}

// Generate answer using Lovable AI
async function generateAnswer(
  question: string, 
  chunks: any[], 
  apiKey: string
): Promise<{ answer: string; coverage: string }> {
  if (chunks.length === 0) {
    return {
      answer: "The Knowledge Base does not contain information to answer this question.",
      coverage: "not_found"
    };
  }

  const context = chunks.map((c, i) => 
    `[Source ${i + 1}: ${c.document_name}]\n${c.content}`
  ).join('\n\n---\n\n');

  const systemPrompt = `You are a helpful assistant that answers questions ONLY using the provided Knowledge Base content.

RULES:
1. Answer ONLY from the provided sources - never use external knowledge
2. If the sources don't contain enough information, say so explicitly
3. Be concise and factual
4. After your answer, include a "Sources:" section citing which documents you used
5. Never invent or hallucinate information

Determine coverage level:
- "fully_supported": Answer is completely backed by sources
- "partially_supported": Some parts are in sources, but not everything
- "not_found": Sources don't contain relevant information

Format your response as JSON:
{
  "answer": "Your answer here with cited sources",
  "coverage": "fully_supported" | "partially_supported" | "not_found"
}`;

  const userPrompt = `KNOWLEDGE BASE CONTENT:
${context}

QUESTION: ${question}

Respond with JSON only.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    throw new Error(`AI API failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  try {
    // Try to parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        answer: parsed.answer || content,
        coverage: parsed.coverage || "partially_supported"
      };
    }
  } catch (e) {
    console.log("Could not parse JSON response, using raw content");
  }

  return { 
    answer: content, 
    coverage: "partially_supported" 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userId } = await req.json();
    
    if (!question || !userId) {
      return new Response(
        JSON.stringify({ error: "question and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing KB query for user ${userId}: ${question.substring(0, 50)}...`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find relevant chunks using keyword matching
    console.log("Finding relevant chunks...");
    const relevantChunks = await findRelevantChunks(
      supabase, 
      question, 
      userId,
      5
    );
    console.log(`Found ${relevantChunks.length} relevant chunks`);

    // Generate answer
    console.log("Generating answer...");
    const { answer, coverage } = await generateAnswer(question, relevantChunks, lovableApiKey);

    // Format sources for response
    const sources = relevantChunks.map((chunk: any) => ({
      documentName: chunk.document_name,
      excerpt: chunk.content.substring(0, 300) + (chunk.content.length > 300 ? '...' : ''),
      similarity: Math.min(Math.round(chunk.score * 25), 100), // Normalize score to percentage-like
      chunkIndex: chunk.chunk_index,
    }));

    console.log(`Query complete. Coverage: ${coverage}`);

    return new Response(
      JSON.stringify({ 
        answer,
        coverage,
        sources,
        chunksUsed: relevantChunks.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error querying knowledge base:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
