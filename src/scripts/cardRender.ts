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
  .set("mpa", "FF5D01");

async function loadCards<T>(
  url: string,
  renderCard: (data: T) => string,
  containerHTML: HTMLElement,
): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    containerHTML.classList = "flex gap-4 my-4 mx-2 overflow-auto";

    const items = (await response.json()) as T[];

    containerHTML.innerHTML = items.map(renderCard).join("");
  } catch (error) {
    console.error(`Failed to load posts: ${error}`);
  }
}

function renderBlogCard(data: BlogMetadata) {
  const tags: string[] = [];
  for (const tag of data.tags) {
    const hexColor = techStackHexColorMap.get(tag.toLowerCase());
    tags.push(`
      <span
        style="color: #${hexColor ? hexColor : "F3F4F6"}; background-color: #${hexColor ? hexColor : "F3F4F6"}25;"
        class="rounded-full p-1 px-3"
        >${tag}
      </span>`);
  }
  return `
    <a
      href="${data.url}"
      class="flex flex-col md:hover:scale-98 min-w-60 md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4 transition-all md:hover:bg-gray-100 md:dark:hover:bg-[#202020] active:scale-97 md:active:scale-96"
    >
      <h3 class="text-lg line-clamp-2 font-bold">${data.title}</h3>
      <span class="text-sm text-gray-400">${data.date ? new Date(data.date).toLocaleDateString() : "Date not found"}</span>
      <img
        class="object-cover aspect-video my-2"
        src="${data.coverImage}"
        alt="Cover image"
      />
      <p class="text-base line-clamp-3 my-4">
        ${data.description}
      </p>
      <div class="flex flex-wrap gap-2">
        ${tags.join("")}
      </div>
    </a>`;
}

function renderProjectCard(data: ProjectMetadata) {
  let techStacks: string[] = [];

  for (const techStack of data.techStack) {
    const hexColor = techStackHexColorMap.get(techStack.toLowerCase());
    techStacks.push(`
      <span
        style="color: #${hexColor}; background-color: #${hexColor}25;"
        class="rounded-full p-1 px-3"
        >${techStack}
      </span>`);
  }

  return `
    <a
      href="${data.url}"
      class="flex md:hover:bg-gray-100 md:dark:hover:bg-[#202020] flex-col min-w-60 md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4 transition-all active:scale-97 md:hover:scale-98 md:active:scale-96"
    >
      <h3 class="text-lg line-clamp-2 font-bold">${data.title}</h3>
      <span class="text-sm text-gray-400">${data.date ? new Date(data.date).toLocaleDateString() : "Date not found"}</span>
      <img
        class="object-cover aspect-video my-2"
        src="${data.coverImage}"
        alt="Cover image"
      />
      <p class="text-base line-clamp-3 my-4">
        ${data.description}
      </p>
      <div class="flex flex-wrap gap-2">
        ${techStacks.join("")}
      </div>
    </a>`;
}
