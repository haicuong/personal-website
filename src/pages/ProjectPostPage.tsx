import { FormattedDate } from "../components/FormattedDate";
import { GiscusComments } from "../components/GiscusComments";
import { Layout } from "../components/Layout";
import { TagList } from "../components/TagList";
import type { ProjectPostPageData } from "../scripts/types";

export interface ProjectPostPageProps {
  project: ProjectPostPageData;
}

export function ProjectPostPage({ project }: ProjectPostPageProps) {
  return (
    <Layout activeSection="projects">
      <article className="prose-p:my-6 prose-h1:text-3xl prose-code:wrap-anywhere prose-img:my-2 prose-h1:text-center prose-h1:mb-8 prose-h1:mt-8 prose dark:prose-invert w-full max-w-none mx-auto">
        <img
          className="aspect-video mx-auto md:aspect-16/4 object-cover rounded-3xl"
          src={project.coverImage}
          alt="Cover Image"
        />
        <hr />
        <h1>{project.title}</h1>
        <p>
          Created: <FormattedDate date={project.date} />
        </p>
        <div className="flex items-center flex-wrap gap-2">
          Tags: <TagList tags={project.techStack} />
        </div>
        <p>{project.description}</p>
        <p>
          🔴 Live demo:{" "}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.liveUrl.replace("https://", "")}
            </a>
          ) : (
            "Updating..."
          )}
          <br />
          💻 Source code:{" "}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.repoUrl.replace("https://github.com/", "@")}
            </a>
          ) : (
            "Updating..."
          )}
        </p>
        <div dangerouslySetInnerHTML={{ __html: project.contentHtml }} />
      </article>
      <GiscusComments />
    </Layout>
  );
}

