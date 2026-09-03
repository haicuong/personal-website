import type { PostMetadata } from "./types/blog-types";

let posts: PostMetadata[];
const postsContainerHTML = document.querySelector("#post-container");

async function loadBlogPost(): Promise<void> {
  if (!postsContainerHTML || !(postsContainerHTML instanceof HTMLElement)) {
    console.error(`Posts container not found`);
    return;
  }
  try {
    const response = await fetch("/posts.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    posts = await response.json();

    for (const post of posts) {
      postsContainerHTML.innerHTML += `
        <a
          href="${post.url}"
          class="flex flex-col min-w-60 md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4 transition-all md:hover:bg-gray-100 md:dark:hover:bg-[#232323] active:scale-97"
        >
          <h3 class="text-lg line-clamp-2 font-bold">${post.title}</h3>
          <span class="text-sm text-gray-400">${post.date ? new Date(post.date).toLocaleDateString() : "Date not found"}</span>
          <img
            class="object-cover aspect-video my-2"
            src="${post.coverImage}"
            alt="Cover image"
          />
          <p class="text-base line-clamp-3 my-4">
            ${post.description}
          </p>
        </a>`;
    }
  } catch (error) {
    console.error(`Failed to load posts: ${error}`);
  }
}

loadBlogPost();
