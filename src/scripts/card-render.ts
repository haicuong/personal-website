import { renderTags } from "./tags-render";
import type { BlogMetadata, ProjectMetadata } from "./types";

const projectsContainerHTML = document.querySelector("#projects-container");
const blogContainerHTML = document.querySelector("#blogs-container");

if (projectsContainerHTML && projectsContainerHTML instanceof HTMLElement)
  loadCards("/projects.json", renderProjectCard, projectsContainerHTML);

if (blogContainerHTML && blogContainerHTML instanceof HTMLElement)
  loadCards("/blogs.json", renderBlogCard, blogContainerHTML);

async function loadCards<T>(
  url: string,
  renderCard: (data: T) => string,
  containerHTML: HTMLElement,
  limit?: number,
): Promise<T[]> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const items = (await response.json()) as T[];
    if (limit && items.length > limit) {
      items.splice(limit);
    }

    containerHTML.classList = "flex gap-4 my-4 mx-2 overflow-auto";
    containerHTML.innerHTML = items.map(renderCard).join("");

    return items;
  } catch (error) {
    console.error(`Failed to load posts: ${error}`);
    return [];
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
      <div class="flex flex-wrap gap-2 max-h-18 overflow-hidden">
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
      <div class="flex flex-wrap gap-2 max-h-18 overflow-hidden">
        ${renderTags(data.techStack)}
      </div>
    </a>`;
}
export { renderTags };
