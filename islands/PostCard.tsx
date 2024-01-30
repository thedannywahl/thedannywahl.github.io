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
    >
      <article class="rounded-xl shadow mb-10 sm:p-6 p-8 bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-teal-100 dark:shadow-none dark:border-2 dark:border-teal-300 hover:dark:border-teal-500 dark:bg-slate-800 hover:dark:from-slate-800 hover:dark:to-teal-700">
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
    </a>
  );
}
