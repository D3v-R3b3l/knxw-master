export function sanitizeHtml(input) {
  if (!input || typeof input !== 'string') return '';
  // Strip script/style tags and inline event handlers
  let out = input.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  // Remove inline event handlers like onclick="..."
  out = out.replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '');
  // Disallow javascript: urls
  out = out.replace(/javascript:/gi, '');
  return out;
}

export default sanitizeHtml;