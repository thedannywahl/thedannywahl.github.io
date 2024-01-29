import { Handlers, PageProps } from "$fresh/server.ts";
import { getPosts, Post } from "@/utils/posts.tsx";
import { PostCard } from "@/islands/PostCard.tsx";

export const handler: Handlers<Post[]> = {
  async GET(_req, ctx) {
    const posts = await getPosts();
    return ctx.render(posts);
  },
};

export default function Blog(props: PageProps<Post[]>) {
  const posts = props.data;
  return (
    <>
      <div
        id="feed"
        class="max-w-screen-md mx-auto justify-center mt-2 lg:mt-12 p-4 sm:p-8"
      >
        <div>
          <h1 class="text-2xl sm:text-4xl inline">
            Blog
          </h1>
        </div>

        <div class="mt-6 lg:mt-10">
          {posts.map((post) => <PostCard post={post} />)}
        </div>
      </div>
    </>
  );
}
