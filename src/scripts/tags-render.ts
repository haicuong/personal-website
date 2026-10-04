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
  ["react", "3B82C4"],
  ["react router", "F44250"],
  ["tanstack query", "E15222"],
  ["motion", "0099FF"],
]);

export function renderTags(tags: string[]) {
  let render: string = "";
  for (const tag of tags) {
    const hexColor = tagsHexColorMap.get(tag.toLowerCase());
    const style = hexColor
      ? `style="color: #${hexColor}; background-color: #${hexColor}25;"`
      : "";
    const defaultColorClasses = hexColor
      ? ""
      : "text-black bg-[#00000015] dark:text-[#F3F4F6] dark:bg-[#F3F4F625]";

    render += `
      <span
        ${style}
        class="rounded-full p-1 px-3 ${defaultColorClasses}"
        >${tag}
      </span>`;
  }

  return render;
}
