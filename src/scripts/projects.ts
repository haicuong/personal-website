import type { ProjectMetadata } from "./types/projects-types";

let projects: ProjectMetadata[];
const projectsContainerHTML = document.querySelector("#projects-container");

const techStackHexColorMap = new Map<string, string>();
techStackHexColorMap
  .set("html", "E34F26")
  .set("tailwindcss", "38BDF8")
  .set("typescript", "3178C6")
  .set("vite", "646CFF")
  .set("mpa", "FF5D01");

async function loadProjects(): Promise<void> {
  if (
    !projectsContainerHTML ||
    !(projectsContainerHTML instanceof HTMLElement)
  ) {
    console.error(`Projects container not found`);
    return;
  }
  try {
    const response = await fetch("/projects.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    projects = await response.json();

    for (const project of projects) {
      let techStacks: string[] = [];

      for (const techStack of project.techStack) {
        const hexColor = techStackHexColorMap.get(techStack.toLowerCase());
        techStacks.push(`
          <span
            style="color: #${hexColor}; background-color: #${hexColor}25;"
            class="rounded-full p-1 px-3"
            >${techStack}
          </span>`);
      }

      projectsContainerHTML.innerHTML += `
        <a
          href="${project.url}"
          class="flex flex-col min-w-60 md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4 transition-all md:hover:bg-gray-100 md:dark:hover:bg-[#232323] active:scale-97"
        >
          <h3 class="text-lg line-clamp-2 font-bold">${project.title}</h3>
          <span class="text-sm text-gray-400">${project.date ? new Date(project.date).toLocaleDateString() : "Date not found"}</span>
          <img
            class="object-cover aspect-video my-2"
            src="${project.coverImage}"
            alt="Cover image"
          />
          <p class="text-base line-clamp-3 my-4">
            ${project.description}
          </p>
          <div class="flex flex-wrap gap-2">
            ${techStacks.join("")}
          </div>
        </a>`;
    }
  } catch (error) {
    console.error(`Failed to load posts: ${error}`);
  }
}

loadProjects();
