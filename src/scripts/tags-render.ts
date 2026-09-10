const tagsHexColorMap = new Map<string, string>([
  ["html", "E34F26"],
  ["tailwindcss", "38BDF8"],
  ["typescript", "3178C6"],
  ["vite", "646CFF"],
  ["mpa", "FF5D01"],
  ["vercel", "0070f3"],
  ["javascript", "D4A017"],
  ["css", "1572B6"],
  ["technical note", "60A5FA"],
  ["debug", "A855F7"],
  ["webdev", "14B8A6"],
  ["frontend", "EC4899"],
  ["test", "10B981"],
  ["cloudflare", "F48120"],
]);

export function renderTags(tags: string[]) {
  let render: string = "";
  for (const tag of tags) {
    const hexColor = tagsHexColorMap.get(tag.toLowerCase());
    render += `
      <span
        style="color: ${hexColor ? `#${hexColor}` : "light-dark(#000000, #F3F4F6)"}; background-color: ${hexColor ? `#${hexColor}25` : "light-dark(#00000015, #F3F4F625)"};"
        class="rounded-full p-1 px-3"
        >${tag}
      </span>`;
  }

  return render;
}
