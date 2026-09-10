import type { BlogMetadata, ProjectMetadata } from "./types";

const projectsContainerHTML = document.querySelector("#projects-container");
const blogContainerHTML = document.querySelector("#blogs-container");

if (projectsContainerHTML && projectsContainerHTML instanceof HTMLElement)
  loadCards("/projects.json", renderProjectCard, projectsContainerHTML);

if (blogContainerHTML && blogContainerHTML instanceof HTMLElement)
  loadCards("/blogs.json", renderBlogCard, blogContainerHTML);

const techStackHexColorMap = new Map<string, string>()
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
  .set("test", "10B981");

async function loadCards<T>(
  url: string,
  renderCard: (data: T) => string,
  containerHTML: HTMLElement,
  limit?: number,
): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    containerHTML.classList = "flex gap-4 my-4 mx-2 overflow-auto";

    const items = (await response.json()) as T[];
    if (limit && items.length > limit) {
      items.splice(limit);
    }

    containerHTML.innerHTML = items.map(renderCard).join("");
  } catch (error) {
    console.error(`Failed to load posts: ${error}`);
  }
}

function renderBlogCard(data: BlogMetadata) {
  return `
    <a
      href="${data.url}"
      class="flex flex-col md:hover:scale-98 min-w-[60vw] md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4 transition-all md:dark:hover:bg-[#202020] md:hover:bg-gray-100 active:bg-gray-100 dark:active:bg-[#1c1c1c] active:scale-97 md:active:scale-96"
    >
      <h3 class="text-lg line-clamp-2 h-[2lh] font-bold">${data.title}</h3>
      <span class="text-sm text-gray-400">${data.date ? new Date(data.date).toLocaleDateString() : "Date not found"}</span>
      ${
        data.coverImage
          ? `
            <img
            class="object-cover aspect-video my-2"
            src="${data.coverImage}"
            alt="Cover image"
            />`
          : ""
      }
      <p class="text-base flex-1 line-clamp-3 my-4">
        ${data.description}
      </p>
      <div class="flex flex-wrap gap-2">
        ${renderTags(data.tags)}
      </div>
    </a>`;
}

function renderProjectCard(data: ProjectMetadata) {
  return `
    <a
      href="${data.url}"
      class="flex md:hover:bg-gray-100 md:dark:hover:bg-[#202020] active:bg-gray-100 dark:active:bg-[#1c1c1c] flex-col min-w-[60vw] md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4 transition-all active:scale-97 md:hover:scale-98 md:active:scale-96"
    >
      <h3 class="text-lg line-clamp-2 h-[2lh] font-bold">${data.title}</h3>
      <span class="text-sm text-gray-400">${data.date ? new Date(data.date).toLocaleDateString() : "Date not found"}</span>
      <img
        class="object-cover aspect-video my-2"
        src="${data.coverImage}"
        alt="Cover image"
      />
      <p class="text-base flex-1 line-clamp-3 my-4">
        ${data.description}
      </p>
      <div class="flex flex-wrap gap-2">
        ${renderTags(data.techStack)}
      </div>
    </a>`;
}

function renderTags(tags: string[]) {
  let render: string = "";
  for (const tag of tags) {
    const hexColor = techStackHexColorMap.get(tag.toLowerCase());
    render += `
      <span
        style="color: ${hexColor ? `#${hexColor}` : "light-dark(#000000, #F3F4F6)"}; background-color: ${hexColor ? `#${hexColor}25` : "light-dark(#00000015, #F3F4F625)"};"
        class="rounded-full p-1 px-3"
        >${tag}
      </span>`;
  }

  return render;
}
