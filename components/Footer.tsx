import BrandGithub from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/brand-github.tsx";
import BrandLinkedin from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/brand-linkedin.tsx";
import Mail from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/mail.tsx";

export default function Footer() {
  return (
    <div class="flex flex-col md:flex-row w-full max-w-screen-lg gap-8 md:gap-16 px-8 py-8 text-smbg-white bg-gray-100 dark:bg-slate-300">
      <div class="flex-1">
        <div class="flex items-center gap-1">
          <div class="font-thin text-2xl">
            iyWahl
          </div>
        </div>
        <div class="text-gray-500 font-thin">
          I break things.
        </div>
      </div>

      <div class="text-gray-500 space-y-2 text-right">
        <a
          href="https://github.com/thedannywahl/"
          class="inline-block hover:text-black"
          aria-label="GitHub"
        >
          <BrandGithub aria-hidden="true" />
        </a>
        <a
          href="https://www.linkedin.com/in/thedannywahl/"
          class="inline-block hover:text-black"
          aria-label="LinkedIn"
        >
          <BrandLinkedin aria-hidden="true" />
        </a>
        <a
          href="mailto:danny@iywahl.com"
          class="inline-block hover:text-black"
          aria-label="LinkedIn"
        >
          <Mail aria-hidden="true" />
        </a>
        <div class="text-xs">
          Copyright © 2024 iyWahl, LLC.
        </div>
      </div>
    </div>
  );
}
