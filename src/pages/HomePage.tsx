import { BlogCard } from "../components/BlogCard";
import { Layout } from "../components/Layout";
import { ProjectCard } from "../components/ProjectCard";
import type { BlogMetadata, ProjectMetadata } from "../scripts/types";

export interface HomePageProps {
  projects: ProjectMetadata[];
  blogs: BlogMetadata[];
}

export function HomePage({ projects, blogs }: HomePageProps) {
  return (
    <Layout
      activeSection="home"
      mainClassName="flex-1 flex flex-col gap-12 py-8 pb-16 px-[10vw]"
    >
      <header className="flex w-full flex-col gap-1 mb-4 items-center justify-self-start">
        <img
          className="rounded-full size-40 mb-4"
          src="/profile-picture.webp"
          alt="Profile picture"
        />
        <span className="font-bold text-4xl whitespace-nowrap">
          Nguyen Hai Cuong
        </span>
        <p className="text-center text-lg mt-2">
          React & TypeScript Frontend Developer
          <br />
          Software Engineering student at UIT (VNU-HCM) · Open to part-time
          frontend internships and selected freelance projects.
        </p>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">About & Focus</h2>
        <p className="indent-8">
          I'm a frontend developer focused on building responsive web
          applications using React and TypeScript, featuring thoughtful state
          management, API integration, and reliable user interactions.
        </p>
        <p className="indent-8">
          My projects include{" "}
          <a
            href="/projects/posts/movie-browser/"
            className="font-bold hover:underline"
          >
            Movie Browser
          </a>
          , a deployed movie discovery application featuring API integration,
          URL-synchronized search, route-backed detail views, and persistent
          favorites. I also built this personal website using native TypeScript
          and Vite's multi-page architecture, with project and blog pages
          generated from Markdown.
        </p>
        <p className="indent-8">
          I care about how applications behave beyond the happy path, including
          navigation, loading and error states, and maintainable code. I
          document what I learn, explain bugs I've debugged, and share the
          technical decisions behind my projects.
        </p>
        <p className="indent-8">
          I'm currently expanding into backend development with Node.js and
          Express. I'm looking for a part-time frontend internship or student
          developer role compatible with my university schedule, alongside
          selected freelance projects.
        </p>
        <p className="indent-8">
          Explore my{" "}
          <a href="/projects/" className="text-blue-500 hover:underline">
            Projects
          </a>
          ,{" "}
          <a href="/blog/" className="text-blue-500 hover:underline">
            Blogs
          </a>
          , browse my{" "}
          <a
            href="https://github.com/haicuong"
            className="text-blue-500 hover:underline"
          >
            GitHub
          </a>
          , or{" "}
          <a
            className="text-blue-500 hover:underline"
            href="mailto:haicuong.work@gmail.com"
          >
            get in touch
          </a>
          .
        </p>
      </section>
      <section id="projects">
        <h1 className="flex w-full items-center">
          <span className="font-bold text-2xl">Featured Projects</span>
          <a
            className="p-3 ml-auto rounded-lg text-black dark:text-white transition-all md:active:scale-95 active:scale-90 bg-gray-200 dark:bg-[#232323] active:bg-gray-400 dark:active:bg-[#565656] hover:bg-gray-300 dark:hover:bg-[#454545]"
            href="/projects/"
          >
            Projects &rarr;
          </a>
        </h1>
        <div
          id="projects-container"
          className="flex gap-4 my-4 mx-2 overflow-auto"
        >
          {projects.map((project) => (
            <ProjectCard key={project.slug} data={project} />
          ))}
        </div>
      </section>
      <section>
        <h1 className="flex w-full items-center">
          <span className="font-bold text-2xl">Recent posts</span>
          <a
            className="p-3 ml-auto rounded-lg text-black dark:text-white transition-all md:active:scale-95 active:scale-90 bg-gray-200 dark:bg-[#232323] active:bg-gray-400 dark:active:bg-[#565656] hover:bg-gray-300 dark:hover:bg-[#454545]"
            href="/blog/"
          >
            Blog &rarr;
          </a>
        </h1>
        <div
          id="blogs-container"
          className="flex gap-4 my-4 mx-2 overflow-auto"
        >
          {blogs.map((blog) => (
            <BlogCard key={blog.slug} data={blog} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
