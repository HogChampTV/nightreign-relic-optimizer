// Word-based text matching for the search boxes: every whitespace-separated
// word in the query must appear somewhere in the text, in any order, so
// "power attack" finds "Attack Power Up" and "neg damage" finds
// "Damage Negation Up". Both query and text are compared lowercase.
export function queryTokens(query) {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

// Returns a predicate over already-lowercased text.
export function makeMatcher(query) {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return () => true;
  return (text) => tokens.every((t) => text.includes(t));
}
