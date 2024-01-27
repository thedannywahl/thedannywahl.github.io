import { Handlers, PageProps } from "$fresh/server.ts";
import { getPosts, Post } from "../utils/posts.tsx";
import { Head } from "$fresh/runtime.ts";

export const handler: Handlers<Post[]> = {
  async GET(_req, ctx) {
    const posts = await getPosts();
    return ctx.render(posts);
  },
};

function PostCard(props: { post: Post }) {
  const { post } = props;
  return (
    <div class="py-8 border(t gray-200)">
      <a class="sm:col-span-2" href={`/${post.slug}`}>
        <h3 class="text(3xl gray-900) font-bold">
          {post.title}
        </h3>
        <time class="text-gray-500">
          {new Date(post.publishedAt).toLocaleDateString("en-us", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <div class="mt-4 text-gray-900">
          {post.snippet}
        </div>
      </a>
    </div>
  );
}

export default function Blog(props: PageProps<Post[]>) {
  const posts = props.data;
  return (
    <>
      <Head>
        <title>iywahl | Blog</title>
      </Head>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">Blog</h1>
        <div>
          {posts.map((post) => <PostCard post={post} />)}
        </div>
      </div>
    </>
  );
}
