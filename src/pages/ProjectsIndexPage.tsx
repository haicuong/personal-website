import { Layout } from "../components/Layout";
import { ProjectCard } from "../components/ProjectCard";
import type { ProjectMetadata } from "../scripts/types";

export interface ProjectsIndexPageProps {
  projects: ProjectMetadata[];
}

export function ProjectsIndexPage({ projects }: ProjectsIndexPageProps) {
  return (
    <Layout activeSection="projects">
      <h1 className="font-bold text-3xl text-center">Projects</h1>
      <div
        id="projects-container"
        className="flex gap-4 my-4 mx-2 overflow-auto"
      >
        {projects.map((project) => (
          <ProjectCard key={project.slug} data={project} />
        ))}
      </div>
    </Layout>
  );
}

