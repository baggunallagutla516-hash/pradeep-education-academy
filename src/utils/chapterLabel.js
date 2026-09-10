/** "Chapter 3" on its own, or "Chapter 3 · Light" when the chapter was named. */
export function chapterLabel(item) {
  if (!item?.chapterNumber) return '';
  const base = `Chapter ${item.chapterNumber}`;
  return item.chapterName ? `${base} · ${item.chapterName}` : base;
}
