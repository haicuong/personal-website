import { formatDisplayDate } from "../scripts/date-format";
import type { BlogMetadata } from "../scripts/types";
import { TagList } from "./TagList";

interface BlogCardProps {
  data: BlogMetadata;
}

export function BlogCard({ data }: BlogCardProps) {
  const formattedDate = formatDisplayDate(data.date, "Date not found");

  return (
    <a
      href={data.url}
      className="flex flex-col md:hover:scale-98 min-w-[60vw] md:min-w-75 md:max-w-[30vw] border rounded-2xl p-4 text-black dark:text-white transition-all duration-150 md:dark:hover:bg-[#202020] md:hover:bg-gray-100 active:bg-gray-100 dark:active:bg-[#1c1c1c] active:scale-97 md:active:scale-96"
    >
      <h3 className="text-lg line-clamp-2 h-[2lh] font-bold">{data.title}</h3>
      <span className="text-sm text-gray-400">{formattedDate}</span>
      {data.coverImage ? (
        <img
          className="object-cover aspect-video my-2"
          src={data.coverImage}
          alt="Cover image"
        />
      ) : null}
      <p className="text-base flex-1 line-clamp-3 my-4">{data.description}</p>
      <div className="flex flex-wrap gap-2 max-h-18 overflow-hidden">
        <TagList tags={data.tags} />
      </div>
    </a>
  );
}
