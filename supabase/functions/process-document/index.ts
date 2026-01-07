import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking function
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start + overlap >= text.length) break;
  }
  
  return chunks.filter(chunk => chunk.trim().length > 50);
}

// Generate embeddings using Lovable AI
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small"
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Embedding API error:", response.status, errorText);
    throw new Error(`Embedding API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, fileContent, fileName } = await req.json();
    
    if (!documentId || !fileContent) {
      return new Response(
        JSON.stringify({ error: "documentId and fileContent are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing document: ${fileName} (${documentId})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status to processing
    await supabase
      .from('knowledge_documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // Decode base64 content
    let textContent: string;
    try {
      // fileContent is base64 encoded
      const binaryContent = atob(fileContent);
      
      // For text files, decode directly
      if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        textContent = binaryContent;
      } else {
        // For PDF/DOC files, we'll extract text using a simple approach
        // In production, you'd use a proper parsing service
        textContent = binaryContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
      }
    } catch (e) {
      console.error("Error decoding content:", e);
      textContent = fileContent;
    }

    if (!textContent || textContent.length < 10) {
      await supabase
        .from('knowledge_documents')
        .update({ processing_status: 'failed' })
        .eq('id', documentId);
      
      return new Response(
        JSON.stringify({ error: "Could not extract text from document" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Chunk the text
    const chunks = chunkText(textContent);
    console.log(`Created ${chunks.length} chunks from document`);

    // Delete existing chunks for this document
    await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('document_id', documentId);

    // Process each chunk
    const chunkRecords = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      let embedding = null;

      if (lovableApiKey) {
        try {
          embedding = await generateEmbedding(chunk, lovableApiKey);
        } catch (e) {
          console.error(`Failed to generate embedding for chunk ${i}:`, e);
          // Continue without embedding
        }
      }

      chunkRecords.push({
        document_id: documentId,
        content: chunk,
        chunk_index: i,
        embedding: embedding ? `[${embedding.join(',')}]` : null,
      });
    }

    // Insert chunks
    if (chunkRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('knowledge_chunks')
        .insert(chunkRecords);

      if (insertError) {
        console.error("Error inserting chunks:", insertError);
        throw insertError;
      }
    }

    // Update status to completed
    await supabase
      .from('knowledge_documents')
      .update({ processing_status: 'completed' })
      .eq('id', documentId);

    console.log(`Successfully processed document: ${fileName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksCreated: chunkRecords.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});