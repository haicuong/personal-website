class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="flex h-10 gap-3 items-center justify-self-start">
        <img
          class="rounded-full h-full w-auto aspect-square object-cover"
          src="/profile-picture.webp"
          alt="Profile picture"
        />
        <span class="font-bold hidden md:inline">Hai Cuong</span>
      </div>
      <nav class="flex gap-2 justify-center items-center">
        <a id="home" href="/"
          class="p-3 rounded-lg transition-all md:hover:bg-gray-400 md:dark:hover:bg-[#454545] md:active:scale-95 active:scale-90 active:bg-gray-400 dark:active:bg-[#565656]"
        >
          Home
        </a>
        <a id="projects" href="/projects/"
          class="p-3 rounded-lg transition-all md:hover:bg-gray-400 md:dark:hover:bg-[#454545] md:active:scale-95 active:scale-90 active:bg-gray-400 dark:active:bg-[#565656]"
        > 
          Projects
        </a>
        <a id="blog" href="/blog/"
          class="p-3 rounded-lg transition-all md:hover:bg-gray-400 md:dark:hover:bg-[#454545] md:active:scale-95 active:scale-90 active:bg-gray-400 dark:active:bg-[#565656]"
        >
          Blog
        </a>
      </nav>
      <div class="justify-self-end invisible"></div>
    `;

    if (document.getElementById("404")) return;

    const path = window.location.pathname;
    let activeLink;

    if (path.startsWith("/blog")) {
      activeLink = this.querySelector("#blog");
    } else if (path.startsWith("/projects")) {
      activeLink = this.querySelector("#projects");
    } else {
      activeLink = this.querySelector("#home");
    }

    if (activeLink)
      activeLink.classList.add("bg-gray-300", "dark:bg-[#343434]");
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <address class="flex flex-col">
        <span class="text-lg font-bold">Nguyen Hai Cuong</span>
        <span
          >Github:
          <a
            class="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/haicuong"
            >@haicuong</a
          ></span
        >
        <br />
        <span>Contact for work</span>
        <span>
          Email:
          <a class="text-blue-500" href="mailto:haicuong.work@gmail.com"
            >haicuong.work@gmail.com</a
          >
        </span>
      </address>
    `;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
