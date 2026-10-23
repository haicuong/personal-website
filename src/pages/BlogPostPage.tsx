import { FormattedDate } from "../components/FormattedDate";
import { GiscusComments } from "../components/GiscusComments";
import { Layout } from "../components/Layout";
import { TagList } from "../components/TagList";
import type { BlogPostPageData } from "../scripts/types";

export interface BlogPostPageProps {
  post: BlogPostPageData;
}

export function BlogPostPage({ post }: BlogPostPageProps) {
  return (
    <Layout activeSection="blog">
      <article className="prose-p:my-6 prose-h1:text-3xl prose-code:wrap-anywhere prose-img:my-2 prose-h1:text-center prose-h1:mb-8 prose-h1:mt-8 prose dark:prose-invert w-full max-w-none mx-auto">
        <img
          className="aspect-video mx-auto md:aspect-16/4 object-cover rounded-3xl"
          src={post.coverImage}
          alt="Cover Image"
        />
        <hr />
        <h1>{post.title}</h1>
        <p>
          Created: <FormattedDate date={post.date} />
          <br />
          Edited: <FormattedDate date={post.lastEditedDate} />
        </p>
        <div className="flex items-center flex-wrap gap-2">
          Tags:{" "}
          {post.tags.length > 0 ? <TagList tags={post.tags} /> : "No tag found"}
        </div>
        <p>{post.description}</p>
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>
      <GiscusComments />
    </Layout>
  );
}

