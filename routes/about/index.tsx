import { Head } from "$fresh/runtime.ts";

export default function About() {
  return (
    <>
      <Head>
        <title>iyWahl | About</title>
      </Head>
      <header class="bg-[url('/about/header.jpg')] bg-cover bg-center flex min-h-[12em] md:min-h-[24em] justify-center items-center flex-col gap-8 lg:rounded-t-xl">
        <div class="space-y-4 text-center">
          <h1 class="text-2xl sm:text-4xl inline-block font-bold text-white shadow-lg">
            About
          </h1>
        </div>
      </header>
      <article class="prose lg:prose-lg dark:prose-invert p-4 lg:p-12">
        <p>
          I'm{" "}
          <a href="https://www.linkedin.com/in/thedannywahl/">Danny Wahl</a>,
          Managing Member of{" "}
          <span>
            iyWahl<span class="tooltip rounded shadow-lg p-2 bg-gray-50 text-gray-500 -mt-9 text-xs">
              pronounced "eye why wall"
            </span>
          </span>
          , LLC.
        </p>
      </article>
    </>
  );
}
