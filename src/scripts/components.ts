class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="grid w-full grid-cols-3 sticky top-0 z-50 py-2 px-5 bg-gray-200 dark:bg-[#232323]">
        <div class="flex gap-3 items-center justify-self-start">
          <img
            id="header-profile-picture"
            class="rounded-full size-10 object-cover"
            src="profile-picture.jpg"
            alt="Profile picture"
          />
        </div>
        <nav class="flex gap-2 justify-center items-center">
          <button
            class="p-3 transition-colors rounded-lg active:bg-gray-400 dark:active:bg-[#565656] hover:bg-gray-300 dark:hover:bg-[#454545]"
          >
            Home
          </button>
          <button
            class="p-3 transition-colors rounded-lg active:bg-gray-400 dark:active:bg-[#565656] hover:bg-gray-300 dark:hover:bg-[#454545]"
          >
            Projects
          </button>
          <button
            class="p-3 transition-colors rounded-lg active:bg-gray-400 dark:active:bg-[#565656] hover:bg-gray-300 dark:hover:bg-[#454545]"
          >
            Blogs
          </button>
        </nav>
        <div class="justify-self-end invisible">Right</div>
      </header>
    `;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="flex p-8 bg-gray-200 dark:bg-[#232323]">
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
    </footer>
    `;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
