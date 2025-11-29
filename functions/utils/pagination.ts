/**
 * Server-side pagination utilities for list endpoints
 */

export function validatePaginationParams(query) {
  const limit = Math.min(Math.max(parseInt(query.limit) || 50, 1), 200);
  const offset = Math.max(parseInt(query.offset) || 0, 0);
  
  return { limit, offset };
}

export function createPaginationResponse(data, total, limit, offset, baseUrl = '') {
  const hasNext = offset + limit < total;
  const hasPrev = offset > 0;
  
  const response = {
    data,
    pagination: {
      total,
      limit,
      offset,
      hasNext,
      hasPrev,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    }
  };
  
  if (baseUrl) {
    const nextUrl = hasNext ? `${baseUrl}?limit=${limit}&offset=${offset + limit}` : null;
    const prevUrl = hasPrev ? `${baseUrl}?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null;
    
    response.pagination.nextUrl = nextUrl;
    response.pagination.prevUrl = prevUrl;
  }
  
  return response;
}