import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getPost, Post } from "@/utils/posts.tsx";
import { render } from "$gfm";
import ShareCard from "@/islands/ShareCard.tsx";

export const handler: Handlers<Post> = {
  async GET(_req, ctx) {
    try {
      const post = await getPost(ctx.params.slug);
      return ctx.render(post as Post);
    } catch {
      return ctx.renderNotFound();
    }
  },
};

export default function PostPage(props: PageProps<Post>) {
  const post = props.data;

  return (
    <>
      <Head>
        <title>iywahl | Blog | {post.title}</title>
      </Head>
      <article class="max-w-screen-md mx-auto">
        <header class="fm">
          <h1 class="text-2xl sm:text-4xl font-bold">{post.title}</h1>
          <div class="text-gray-500">
            Published: <time>{post.sPublishedAt}</time>
          </div>
          {post.modifiedAt > post.publishedAt
            ? (
              <div class="text-gray-500">
                Modified: <time>{post.sModifiedAt}</time>
              </div>
            )
            : null}
        </header>
        <div
          class="markdown-body prose lg:prose-lg dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: render(post.content, {}),
          }}
        />
      </article>
      <ShareCard {...props} />
    </>
  );
}
