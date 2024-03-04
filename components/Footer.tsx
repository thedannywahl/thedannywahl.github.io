import IconGithub from "$icons/brand-github.tsx";
import IconLinkedin from "$icons/brand-linkedin.tsx";
import IconMail from "$icons/mail.tsx";
import IconCamera from "$icons/camera.tsx";

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
    href: "https://daniellewahl.com/",
    style: "hover:text-[#F444AF]",
  },
];

export default function Footer() {
  return (
    <div class="flex flex-col sm:flex-row w-full max-w-screen-lg gap-8 md:gap-16 p-4 sm:p-8 text-sm bg-gray-100 dark:bg-[#6ba7a5] shadow dark:shadown-none">
      <div class="flex-1">
        <div class="flex lg:items-center gap-1">
          <div class="font-thin text-2xl">
            iyWahl
          </div>
        </div>
        <div class="text-gray-500 dark:text-gray-200 font-thin">
          I break things.
        </div>
      </div>

      <div class="sm:text-right text-gray-500 dark:text-gray-200 ">
        {socials.map((social) => (
          <a
            href={social.href}
            class={`inline-block pe-4 sm:pe-2 last:pe-0 ${social.style}`}
            aria-label={social.name}
          >
            <social.icon
              aria-hidden="true"
              class="size-5 sm:size-6"
            />
          </a>
        ))}
        <div class="font-thin mt-0">
          Copyright © 2024 iyWahl, LLC.
        </div>
      </div>
    </div>
  );
}
