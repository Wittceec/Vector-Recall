export function extractTags(markdown: string): string[] {
  if (!markdown) return [];
  // Match #tag but not # Header
  const tagMatches = markdown.match(/(?:^|\s)(#[a-zA-Z0-9_-]+)/g);
  if (!tagMatches) return [];
  return Array.from(new Set(tagMatches.map(t => t.trim().toLowerCase())));
}

export function extractWikilinks(markdown: string): string[] {
  if (!markdown) return [];
  // Match [[Link]]
  const linkMatches = markdown.match(/\[\[(.*?)\]\]/g);
  if (!linkMatches) return [];
  return Array.from(new Set(linkMatches.map(l => l.replace(/\[\[|\]\]/g, '').trim())));
}

export function extractHeadings(markdown: string) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const headings = [];
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      headings.push({
        d: match[1].length - 1, // 0-indexed depth (# is 0, ## is 1)
        text: match[2].trim(),
      });
    }
  }
  return headings;
}

export function getStats(markdown: string) {
  if (!markdown) return { words: 0, chars: 0 };
  const chars = markdown.length;
  // Remove markdown symbols roughly for word count
  const plain = markdown.replace(/[#*`_\[\]()]/g, '');
  const words = plain.trim().split(/\s+/).filter(w => w.length > 0).length;
  return { words, chars };
}

export function getContextSnippet(markdown: string, query: string): string {
  if (!markdown || !query) return "";
  
  // Find the exact line or block containing the query
  const lines = markdown.split('\n');
  const lowerQuery = query.toLowerCase();
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(lowerQuery)) {
      // Return a chunk of text around the match, preserving wikilinks
      let snippet = lines[i].trim();
      if (snippet.length > 120) {
        const idx = snippet.toLowerCase().indexOf(lowerQuery);
        const start = Math.max(0, idx - 40);
        const end = Math.min(snippet.length, idx + query.length + 60);
        snippet = (start > 0 ? "…" : "") + snippet.substring(start, end) + (end < snippet.length ? "…" : "");
      }
      return snippet;
    }
  }
  return "";
}
