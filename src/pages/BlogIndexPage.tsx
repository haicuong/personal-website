import { BlogCard } from "../components/BlogCard";
import { Layout } from "../components/Layout";
import type { BlogMetadata } from "../scripts/types";

export interface BlogIndexPageProps {
  blogs: BlogMetadata[];
}

export function BlogIndexPage({ blogs }: BlogIndexPageProps) {
  return (
    <Layout activeSection="blog">
      <h1 className="text-center text-3xl font-bold">Blog</h1>
      <div>
        <h2 className="text-2xl font-bold">Recent posts</h2>
        <div
          id="blogs-container"
          className="flex gap-4 my-4 mx-2 overflow-auto"
        >
          {blogs.map((blog) => (
            <BlogCard key={blog.slug} data={blog} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

