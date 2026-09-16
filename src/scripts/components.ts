class SiteHeader extends HTMLElement {
  highlightNav() {
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

  toggleTheme() {
    const themeButton = this.querySelector("#theme");
    if (!themeButton || !(themeButton instanceof HTMLElement)) return;

    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "system");
    updateIcon(localStorage.getItem("theme"));

    function updateIcon(theme: string | null) {
      if (!themeButton || !(themeButton instanceof HTMLElement)) return;

      switch (theme) {
        case "dark":
          themeButton.innerHTML = `<img src="/icon/dark-theme.webp" class="dark:invert" alt="Dark theme icon" />`;
          break;
        case "light":
          themeButton.innerHTML = `<img src="/icon/light-theme.webp" alt="Light theme icon" />`;
          break;
        default:
          themeButton.innerHTML = `<img src="/icon/system-theme.webp" class="dark:invert p-0.5" alt="System theme icon" />`;
          break;
      }
    }

    function loadTheme(theme: string | null) {
      const isDark =
        theme === "dark" ||
        (theme !== "light" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    }

    function switchTheme() {
      const currentTheme = localStorage.getItem("theme");

      switch (currentTheme) {
        case "dark":
          localStorage.setItem("theme", "light");
          break;
        case "light":
          localStorage.setItem("theme", "system");
          break;
        default:
          localStorage.setItem("theme", "dark");
          break;
      }

      const newTheme = localStorage.getItem("theme");

      loadTheme(newTheme);
      updateIcon(newTheme);
    }

    themeButton.addEventListener("click", switchTheme);
  }
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
          class="p-3 rounded-lg text-black dark:text-white transition-all md:hover:bg-gray-400 md:dark:hover:bg-[#454545] md:active:scale-95 active:scale-90 active:bg-gray-400 dark:active:bg-[#565656]"
        >
          Home
        </a>
        <a id="projects" href="/projects/"
          class="p-3 rounded-lg text-black dark:text-white transition-all md:hover:bg-gray-400 md:dark:hover:bg-[#454545] md:active:scale-95 active:scale-90 active:bg-gray-400 dark:active:bg-[#565656]"
        > 
          Projects
        </a>
        <a id="blog" href="/blog/"
          class="p-3 rounded-lg text-black dark:text-white transition-all md:hover:bg-gray-400 md:dark:hover:bg-[#454545] md:active:scale-95 active:scale-90 active:bg-gray-400 dark:active:bg-[#565656]"
        >
          Blog
        </a>
      </nav>
      <button id="theme"
        class="bg-gray-300 transition hover:cursor-pointer hover:bg-gray-400 dark:hover:bg-[#404040] dark:bg-[#343434] rounded-2xl size-12 p-2 justify-self-end active:scale-94 md:hover:scale-96 md:active:scale-92"
      ></button>
    `;

    this.highlightNav();
    this.toggleTheme();
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
