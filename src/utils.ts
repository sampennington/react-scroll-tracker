export function getScrollPercent(document: Document) {
  const h = document.documentElement;
  const b = document.body;

  const scrollTop = h.scrollTop || b.scrollTop;
  const scrollHeight = h.scrollHeight || b.scrollHeight;
  const clientHeight = h.clientHeight;

  const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

  return scrollPercent
}