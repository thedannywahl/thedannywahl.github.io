import { PageProps } from "$fresh/server.ts";
import { Post } from "@/utils/posts.tsx";
import IconTwitter from "$icons/brand-twitter.tsx";
import IconLinkedin from "$icons/brand-linkedin.tsx";
import IconFacebook from "$icons/brand-facebook.tsx";
import IconMail from "$icons/mail.tsx";

export default function ShareCard(props: PageProps<Post>) {
  const post = props.data;
  const shares = [
    {
      name: "Email",
      icon: IconMail,
      url: `mailto:?&subject=iyWahl%3A%20${
        encodeURIComponent(post.title)
      }&body=${encodeURIComponent(post.snippet)}%0D%0A${post.permalink}`,
      style: "hover:text-black",
    },
    {
      name: "Twitter",
      icon: IconTwitter,
      url: `https://twitter.com/home?status=${post.permalink}%20${
        post.tags.split(",").map((tag) => `%23${tag.trim()}`).join("%20")
      }`,
      style: "hover:text-[#1DA1F2]",
    },
    {
      name: "Facebook",
      icon: IconFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${post.permalink}`,
      style: "hover:text-[#4267B2]",
    },
    {
      name: "LinkedIn",
      icon: IconLinkedin,
      url:
        `https://www.linkedin.com/shareArticle?mini=true&amp;url=${post.permalink}&amp;title=${
          encodeURIComponent(post.title)
        }&amp;summary=${
          encodeURIComponent(post.snippet)
        }&amp;source=${post.fqdn}`,
      style: "hover:text-[#0077B5]",
    },
  ];
  return (
    <aside
      id="share"
      class=" mx-auto max-w-screen-sm py-4 px-4 mt-8 lg:my-12 sm:py-6 sm:px-8 lg:rounded-md lg:shadow dark:shadow-none bg-[#90bdbc] dark:bg-gray-800 dark:lg:bg-transparent "
    >
      <small class="pb-4 block">Share this post</small>
      <ul class="block mx-auto">
        {shares.map((share) => (
          <li class="inline-block relative pe-6 last:pe-0">
            <a href={share.url} aria-label={share.name} class="text-white">
              <share.icon
                aria-hidden="true"
                class={`size-5 sm:size-6 ${share.style}`}
              />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
