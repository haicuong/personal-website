import { useTheme } from "../hooks/use-theme";

export type ActiveNavSection = "home" | "projects" | "blog" | "none";

interface SiteHeaderProps {
  activeSection?: ActiveNavSection;
}

const BASE_NAV_LINK_CLASS =
  "p-3 rounded-lg text-black dark:text-white transition-all md:hover:bg-gray-400 md:dark:hover:bg-[#454545] md:active:scale-95 active:scale-90 active:bg-gray-400 dark:active:bg-[#565656]";
const ACTIVE_NAV_LINK_CLASS = "bg-gray-300 dark:bg-[#343434]";

export function SiteHeader({ activeSection = "home" }: SiteHeaderProps) {
  const { theme, cycleTheme } = useTheme();

  console.log("SiteHeader render", { activeSection, theme });

  function getNavLinkClass(section: Exclude<ActiveNavSection, "none">) {
    return activeSection === section
      ? `${BASE_NAV_LINK_CLASS} ${ACTIVE_NAV_LINK_CLASS}`
      : BASE_NAV_LINK_CLASS;
  }

  return (
    <header className="grid w-full grid-cols-3 items-center sticky h-16 top-0 z-50 py-2 px-5 bg-gray-200 dark:bg-[#232323]">
      <div className="flex h-10 gap-3 items-center justify-self-start">
        <img
          className="rounded-full h-full w-auto aspect-square object-cover"
          src="/profile-picture.webp"
          alt="Profile picture"
        />
        <span className="font-bold hidden md:inline">Hai Cuong</span>
      </div>
      <nav className="flex gap-2 justify-center items-center">
        <a id="home" href="/" className={getNavLinkClass("home")}>
          Home
        </a>
        <a
          id="projects"
          href="/projects/"
          className={getNavLinkClass("projects")}
        >
          Projects
        </a>
        <a id="blog" href="/blog/" className={getNavLinkClass("blog")}>
          Blog
        </a>
      </nav>
      <button
        id="theme"
        type="button"
        onClick={cycleTheme}
        className="bg-gray-300 transition hover:cursor-pointer hover:bg-gray-400 dark:hover:bg-[#404040] dark:bg-[#343434] rounded-2xl size-12 p-2 justify-self-end active:scale-94 md:hover:scale-96 md:active:scale-92"
      >
        {theme === "dark" ? (
          <img
            src="/icon/dark-theme.webp"
            className="dark:invert"
            alt="Dark theme icon"
          />
        ) : theme === "light" ? (
          <img src="/icon/light-theme.webp" alt="Light theme icon" />
        ) : theme === "system" ? (
          <img
            src="/icon/system-theme.webp"
            className="dark:invert p-0.5"
            alt="System theme icon"
          />
        ) : null}
      </button>
    </header>
  );
}
