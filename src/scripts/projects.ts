import type { ProjectMetadata } from "./types/projects";

let projects: ProjectMetadata[];
const projectsContainerHTML = document.querySelector("#projects-container");

async function loadBlogPost(): Promise<void> {
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
      projectsContainerHTML.innerHTML += `
        <a
          href="${project.url}"
          class="flex flex-col min-w-75 md:max-w-[30vw] border rounded-2xl p-4 transition-all md:hover:bg-gray-100 md:dark:hover:bg-[#232323] active:scale-97"
        >
          <h3 class="text-lg font-bold">${project.title}</h3>
          <span class="text-sm text-gray-400">${project.date ? new Date(project.date).toLocaleDateString() : "Date not found"}</span>
          <img
            class="object-cover aspect-video my-2"
            src="${project.coverImage}"
            alt="Cover image"
          />
          <p class="text-base my-4">
            ${project.description}
          </p>
        </a>`;
    }

    console.log("Loaded posts");
  } catch (error) {
    console.error(`Failed to load posts: ${error}`);
  }
}

loadBlogPost();
