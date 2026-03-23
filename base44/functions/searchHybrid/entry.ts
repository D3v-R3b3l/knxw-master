import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { InvokeLLM } from '@/integrations/Core';

// Vector similarity calculation (cosine similarity)
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Simple BM25-like scoring
function calculateBM25Score(query, text, k1 = 1.2, b = 0.75) {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const textTerms = text.toLowerCase().split(/\s+/);
  const textLength = textTerms.length;
  const avgDocLength = 100; // Assumed average document length
  
  let score = 0;
  
  for (const term of queryTerms) {
    const termFreq = textTerms.filter(t => t.includes(term)).length;
    if (termFreq > 0) {
      const idf = Math.log((1000 + 1) / (termFreq + 1)); // Simplified IDF
      const tfComponent = (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + b * (textLength / avgDocLength)));
      score += idf * tfComponent;
    }
  }
  
  return score;
}

// Generate query embedding
async function generateQueryEmbedding(query, provider = 'openai') {
  if (provider === 'openai') {
    try {
      // Simulate OpenAI embedding
      const mockEmbedding = Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2);
      return {
        embedding: mockEmbedding,
        dimensions: 1536
      };
    } catch (error) {
      console.error('Query embedding failed:', error);
      return {
        embedding: Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2),
        dimensions: 1536
      };
    }
  } else {
    return {
      embedding: Array.from({ length: 384 }, () => (Math.random() - 0.5) * 2),
      dimensions: 384
    };
  }
}

// LLM-based reranking
async function rerankResults(query, results, topK = 8) {
  if (results.length <= topK) return results.slice(0, topK);
  
  try {
    const rerankPrompt = `
Query: "${query}"

Please rerank these search results by relevance to the query. Return a JSON array with the indices of the results in order of relevance (most relevant first). Only return the top ${topK} results.

Results:
${results.slice(0, 24).map((r, i) => `${i}: ${r.snippet}`).join('\\n')}
    `;

    const response = await InvokeLLM({
      prompt: rerankPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          ranked_indices: {
            type: "array",
            items: { type: "number" },
            description: "Indices of results in order of relevance"
          },
          reasoning: {
            type: "string",
            description: "Brief explanation of ranking decisions"
          }
        }
      }
    });

    if (response.ranked_indices && Array.isArray(response.ranked_indices)) {
      const reranked = response.ranked_indices
        .slice(0, topK)
        .map(idx => results[idx])
        .filter(Boolean);
      
      // Fill remaining slots with original order if needed
      const usedIndices = new Set(response.ranked_indices.slice(0, topK));
      for (let i = 0; i < results.length && reranked.length < topK; i++) {
        if (!usedIndices.has(i)) {
          reranked.push(results[i]);
        }
      }
      
      return reranked.slice(0, topK);
    }
  } catch (error) {
    console.error('Reranking failed:', error);
  }
  
  // Fallback to original order
  return results.slice(0, topK);
}

Deno.serve(async (req) => {
  const startTime = performance.now();
  const traceId = crypto.randomUUID();
  let knnTime = 0, bm25Time = 0, rerankTime = 0;
  let payload = {};
  let base44;
  
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    payload = await req.json();
    const { 
      org_id, 
      workspace_id, 
      query, 
      filters = {}, 
      top_k = 8 
    } = payload;

    if (!org_id || !workspace_id || !query) {
      return Response.json({ 
        error: 'Missing required fields: org_id, workspace_id, query' 
      }, { status: 400 });
    }

    // 1. Verify access permissions
    const orgUsers = await base44.entities.OrgUser.filter({ 
      org_id, 
      user_email: user.email 
    });
    
    if (orgUsers.length === 0) {
      return Response.json({ error: 'Access denied to organization' }, { status: 403 });
    }

    // 2. Get workspace for embedding settings
    const workspaces = await base44.entities.TenantWorkspace.filter({ 
      id: workspace_id, 
      org_id 
    });
    
    if (workspaces.length === 0) {
      return Response.json({ error: 'Workspace not found or access denied' }, { status: 404 });
    }
    
    const workspace = workspaces[0];
    const embeddingProvider = workspace.settings?.default_embedding_provider || 'openai';

    // 3. Generate query embedding
    const knnStart = performance.now();
    const queryEmbedding = await generateQueryEmbedding(query, embeddingProvider);
    
    // 4. Vector KNN search
    const embeddings = await base44.entities.DocumentEmbedding.filter({
      doc_id: { $exists: true } // This would need proper vector search in production
    });
    
    // Filter embeddings by org/workspace through document relationship
    const documents = await base44.entities.Document.filter({ 
      org_id, 
      workspace_id,
      processing_status: 'completed'
    });
    
    const validDocIds = new Set(documents.map(d => d.id));
    const filteredEmbeddings = embeddings.filter(e => validDocIds.has(e.doc_id));
    
    // Calculate vector similarities
    const vectorResults = filteredEmbeddings.map(embedding => {
      const similarity = cosineSimilarity(queryEmbedding.embedding, embedding.vector);
      const doc = documents.find(d => d.id === embedding.doc_id);
      
      return {
        doc_id: embedding.doc_id,
        chunk_index: embedding.chunk_index,
        vector_score: similarity,
        snippet: embedding.chunk_text.substring(0, 200) + '...',
        source_uri: doc?.uri || '',
        metadata: embedding.metadata
      };
    }).sort((a, b) => b.vector_score - a.vector_score);
    
    knnTime = performance.now() - knnStart;

    // 5. BM25 text search
    const bm25Start = performance.now();
    const textResults = filteredEmbeddings.map(embedding => {
      const bm25Score = calculateBM25Score(query, embedding.chunk_text);
      const doc = documents.find(d => d.id === embedding.doc_id);
      
      return {
        doc_id: embedding.doc_id,
        chunk_index: embedding.chunk_index,
        bm25_score: bm25Score,
        snippet: embedding.chunk_text.substring(0, 200) + '...',
        source_uri: doc?.uri || '',
        metadata: embedding.metadata
      };
    }).sort((a, b) => b.bm25_score - a.bm25_score);
    
    bm25Time = performance.now() - bm25Start;

    // 6. Fuse scores (simple weighted combination)
    const fusedResults = vectorResults.map(vResult => {
      const tResult = textResults.find(t => 
        t.doc_id === vResult.doc_id && t.chunk_index === vResult.chunk_index
      );
      
      const fusedScore = (vResult.vector_score * 0.6) + ((tResult?.bm25_score || 0) * 0.4);
      
      return {
        ...vResult,
        bm25_score: tResult?.bm25_score || 0,
        fused_score: fusedScore,
        citations: [`${vResult.source_uri}#chunk-${vResult.chunk_index}`]
      };
    }).sort((a, b) => b.fused_score - a.fused_score);

    // 7. LLM Rerank top 24 results
    const rerankStart = performance.now();
    const topCandidates = fusedResults.slice(0, 24);
    const finalResults = await rerankResults(query, topCandidates, top_k);
    rerankTime = performance.now() - rerankStart;

    // 8. Log search event
    await base44.entities.SystemEvent.create({
      org_id,
      workspace_id,
      actor_type: 'user',
      actor_id: user.email,
      event_type: 'search',
      severity: 'info',
      payload: {
        query,
        results_count: finalResults.length,
        total_candidates: fusedResults.length,
        knn_ms: Math.round(knnTime),
        bm25_ms: Math.round(bm25Time),
        rerank_ms: Math.round(rerankTime),
        total_ms: Math.round(performance.now() - startTime)
      },
      trace_id: traceId,
      timestamp: new Date().toISOString()
    });

    // 9. Return results with diagnostics
    return Response.json({
      results: finalResults.map(result => ({
        doc_id: result.doc_id,
        snippet: result.snippet,
        score: result.fused_score,
        source_uri: result.source_uri,
        chunk_idx: result.chunk_index,
        citations: result.citations
      })),
      diagnostics: {
        knn_ms: Math.round(knnTime),
        bm25_ms: Math.round(bm25Time),
        rerank_ms: Math.round(rerankTime),
        total_ms: Math.round(performance.now() - startTime),
        total_candidates: fusedResults.length,
        embedding_provider: embeddingProvider,
        trace_id: traceId
      }
    });

  } catch (error) {
    console.error('Hybrid search failed:', error);
    
    // Log error event
    try {
      if (base44) {
        await base44.entities.SystemEvent.create({
          org_id: payload?.org_id || 'unknown',
          workspace_id: payload?.workspace_id || 'unknown',
          actor_type: 'system',
          actor_id: 'search_hybrid',
          event_type: 'error',
          severity: 'error',
          payload: {
            error: error.message,
            query: payload?.query || '',
            processing_time_ms: performance.now() - startTime
          },
          trace_id: traceId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (logError) {
      console.error('Failed to log error event:', logError);
    }
    
    return Response.json({ 
      error: 'Search failed', 
      details: error.message,
      trace_id: traceId
    }, { status: 500 });
  }
});