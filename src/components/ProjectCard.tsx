import { formatDisplayDate } from "../scripts/date-format";
import type { ProjectMetadata } from "../scripts/types";
import { TagList } from "./TagList";

interface ProjectCardProps {
  data: ProjectMetadata;
}

export function ProjectCard({ data }: ProjectCardProps) {
  const formattedDate = formatDisplayDate(data.date, "Date not found");

  return (
    <a
      href={data.url}
      className="flex md:hover:bg-gray-100 md:dark:hover:bg-[#202020] active:bg-gray-100 dark:active:bg-[#1c1c1c] flex-col min-w-[60vw] md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4 text-black dark:text-white transition-all duration-150 active:scale-97 md:hover:scale-98 md:active:scale-96"
    >
      <h3 className="text-lg line-clamp-2 h-[2lh] font-bold">{data.title}</h3>
      <span className="text-sm text-gray-400">{formattedDate}</span>
      <img
        className="object-cover aspect-video my-2"
        src={data.coverImage}
        alt="Cover image"
      />
      <p className="text-base flex-1 line-clamp-3 my-4">{data.description}</p>
      <div className="flex flex-wrap gap-2 max-h-18 overflow-hidden">
        <TagList tags={data.techStack} />
      </div>
    </a>
  );
}
