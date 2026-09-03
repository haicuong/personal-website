import type { PostMetadata } from "./types/blog";

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
          class="flex flex-col transition-colors hover:bg-gray-100 dark:hover:bg-[#202020] md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4"
        >
          <h3 class="text-lg font-bold">${post.title}</h3>
          <span class="text-sm text-gray-400">${new Date(post.date).toLocaleDateString()}</span>
          <img
            class="object-cover aspect-video my-2"
            src="${post.coverImage}"
            alt="Cover image"
          />
          <p class="text-base my-4">
            ${post.description}
          </p>
        </a>`;
    }

    console.log("Loaded posts");
  } catch (error) {
    console.error(`Failed to load posts: ${error}`);
  }
}

loadBlogPost();
