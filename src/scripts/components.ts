class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="flex h-10 gap-3 items-center justify-self-start">
        <img
          class="rounded-full h-full w-auto aspect-square object-cover"
          src="/profile-picture.jpg"
          alt="Profile picture"
        />
        <span class="font-bold hidden md:inline">Hai Cuong</span>
      </div>
      <nav class="flex gap-2 justify-center items-center">
        <a href="/"
          class="p-3 rounded-lg transition-all md:active:scale-95 active:scale-90 bg-gray-300 dark:bg-[#454545] md:bg-transparent md:dark:bg-transparent active:bg-gray-400 dark:active:bg-[#565656] hover:bg-gray-300 dark:hover:bg-[#454545]"
        >
          Home
        </a>
        <a href="/projects/"
          class="p-3 rounded-lg transition-all md:active:scale-95 active:scale-90 bg-gray-300 dark:bg-[#454545] md:bg-transparent md:dark:bg-transparent active:bg-gray-400 dark:active:bg-[#565656] hover:bg-gray-300 dark:hover:bg-[#454545]"
        > 
          Projects
        </a>
        <a href="/blog/"
          class="p-3 rounded-lg transition-all md:active:scale-95 active:scale-90 bg-gray-300 dark:bg-[#454545] md:bg-transparent md:dark:bg-transparent active:bg-gray-400 dark:active:bg-[#565656] hover:bg-gray-300 dark:hover:bg-[#454545]"
        >
          Blog
        </a>
      </nav>
      <div class="justify-self-end invisible"></div>
    `;
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
