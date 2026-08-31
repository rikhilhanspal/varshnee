export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function checkTextAnswer(input: string, correct: string, variants: string[] = []): boolean {
  const norm = normalizeAnswer(input);
  const answers = [correct, ...variants].map(normalizeAnswer);
  return answers.includes(norm);
}

export function checkWordOrder(tiles: string[], correctOrder: string[]): boolean {
  if (tiles.length !== correctOrder.length) return false;
  return tiles.every((id, i) => id === correctOrder[i]);
}

export function checkMatching(
  userPairs: Record<string, string>,
  correctPairs: { left: string; right: string }[]
): boolean {
  return correctPairs.every((pair) => userPairs[pair.left] === pair.right);
}
