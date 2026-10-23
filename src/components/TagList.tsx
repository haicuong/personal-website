import { getTagHexColor } from "../scripts/tags-render";

interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  return (
    <>
      {tags.map((tag, index) => {
        const hexColor = getTagHexColor(tag);
        const defaultColorClasses = hexColor
          ? ""
          : "text-black bg-[#00000015] dark:text-[#F3F4F6] dark:bg-[#F3F4F625]";
        const style = hexColor
          ? { color: `#${hexColor}`, backgroundColor: `#${hexColor}25` }
          : undefined;

        return (
          <span
            key={`${tag}-${index}`}
            style={style}
            className={`rounded-full p-1 px-3 ${defaultColorClasses}`}
          >
            {tag}
          </span>
        );
      })}
    </>
  );
}

