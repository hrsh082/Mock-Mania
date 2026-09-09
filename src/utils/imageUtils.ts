export function formatImgSrc(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Handle raw SVG XML strings
  if (trimmed.startsWith('<svg')) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`;
  }

  // Handle raw unencoded SVG Data URIs
  if (trimmed.startsWith('data:image/svg+xml;utf8,')) {
    const rawContent = trimmed.slice('data:image/svg+xml;utf8,'.length);
    try {
      const decoded = decodeURIComponent(rawContent.replace(/%23/g, '#'));
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(decoded)}`;
    } catch {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawContent)}`;
    }
  }

  // Handle SVG data URIs with missing charset declaration
  if (trimmed.startsWith('data:image/svg+xml,<svg')) {
    const rawContent = trimmed.slice('data:image/svg+xml,'.length);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawContent)}`;
  }

  return trimmed;
}
