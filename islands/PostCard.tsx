import { Post } from "@/utils/posts.tsx";

export function PostCard(props: { post: Post }) {
  const { post } = props;
  const metaDate = post.modifiedAt > post.publishedAt
    ? post.sModifiedAt
    : post.sPublishedAt;
  const metaAuthors = post.authors?.split(",") ?? "";
  const metaTags = post.tags?.split(",") ?? "";
  return (
    <a
      href={post.url}
      class="block pt-1 bg-gradient-to-r from-[#90bdbc] to-[#6BA7A5] dark:bg-none rounded-xl shadow children:focus:pt-24"
    >
      <div
        class="bg-contain motion-reduce:pt-24 pt-24 lg:pt-0 lg:hover:pt-24 transition-all duration-300 ease-in-out motion-reduce:transition-none rounded-xl children:hover:rounded-none"
        style={`background-image: url('/blog/${post.slug}/hero.png')`}
      >
        <article class="lg:rounded-xl mb-10 sm:p-6 p-8 bg-gray-50 dark:shadow-none dark:border-2 dark:border-[#6BA7A5] dark:bg-slate-800 transition-all duration-300 ease-in-out">
          <header class="mb-4 sm:mb-6">
            <h2 class="text-2xl sm:text-3xl">
              {post.title}
            </h2>
            <ul class="meta">
              {[metaDate, ...metaAuthors, ...metaTags].map((post) => {
                return (
                  <li class="inline-block relative pe-6 last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-600 before:rounded-full text-gray-500 dark:text-gray-300 dark:before:bg-teal-500">
                    {post}
                  </li>
                );
              })}
            </ul>
          </header>
          <main>
            <p class="clamp-2">
              {post.snippet}
            </p>
          </main>
        </article>
      </div>
    </a>
  );
}
