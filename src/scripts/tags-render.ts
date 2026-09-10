const tagsHexColorMap = new Map<string, string>()
  .set("html", "E34F26")
  .set("tailwindcss", "38BDF8")
  .set("typescript", "3178C6")
  .set("vite", "646CFF")
  .set("mpa", "FF5D01")
  .set("vercel", "0070f3")
  .set("javascript", "D4A017")
  .set("css", "1572B6")
  .set("technical note", "60A5FA")
  .set("debug", "A855F7")
  .set("webdev", "14B8A6")
  .set("frontend", "EC4899")
  .set("test", "10B981")
  .set("cloudflare", "F48120");

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
