import IconGithub from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/brand-github.tsx";
import IconLinkedin from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/brand-linkedin.tsx";
import IconMail from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/mail.tsx";
import IconCamera from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/camera.tsx";

const socials = [
  {
    name: "GitHub",
    icon: IconGithub,
    href: "https://github.com/thedannywahl/",
    style: "hover:text-[#2DBA4E]",
  },
  {
    name: "LinkedIn",
    icon: IconLinkedin,
    href: "https://www.linkedin.com/in/thedannywahl/",
    style: "hover:text-[#0077B5]",
  },
  {
    name: "Email",
    icon: IconMail,
    href: "mailto:danny@iywahl.com",
    style: "hover:text-black",
  },
  {
    name: "Danielle Wahl Photography",
    icon: IconCamera,
    href: "/blog",
    style: "hover:text-[#F444AF]",
  },
];

export default function Footer() {
  return (
    <div class="flex flex-col sm:flex-row w-full max-w-screen-lg gap-8 md:gap-16 p-4 sm:p-8 text-sm  bg-gray-100 dark:bg-teal-900 shadow dark:shadown-none">
      <div class="flex-1">
        <div class="flex lg:items-center gap-1">
          <div class="font-thin text-2xl dark:text-teal-200">
            iyWahl
          </div>
        </div>
        <div class="text-gray-500 dark:text-gray-200 font-thin">
          I break things.
        </div>
      </div>

      <div class="text-gray-500 dark:text-teal-100 space-y-2 sm:text-right">
        {socials.map((social) => (
          <a
            href={social.href}
            class={`inline-block ${social.style}`}
            aria-label={social.name}
          >
            <social.icon aria-hidden="true" />
          </a>
        ))}
        <div class="text-xs dark:text-gray-200">
          Copyright © 2024 iyWahl, LLC.
        </div>
      </div>
    </div>
  );
}
