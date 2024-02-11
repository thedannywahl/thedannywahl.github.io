import { Head } from "$fresh/runtime.ts";

export default function About() {
  return (
    <>
      <Head>
        <title>iyWahl | About</title>
      </Head>
      <header class="bg-[url('/about/header.jpg')] bg-cover bg-center flex min-h-[12em] md:min-h-[24em] justify-center items-center flex-col gap-8 /*lg:rounded-t-xl*/">
        <div class="space-y-4 text-center">
          <h1 class="text-2xl sm:text-4xl inline-block font-bold text-white shadow-lg">
            About
          </h1>
        </div>
      </header>
      <article class="prose lg:prose-lg dark:prose-invert p-4 lg:p-12">
        <p class="text-4xl">Hi,</p>
        <p>
          I'm{" "}
          <a href="https://www.linkedin.com/in/thedannywahl/">Danny Wahl</a>,
          Managing Member of{" "}
          <span>
            iyWahl<span class=" tooltip rounded shadow-lg p-2 bg-gray-50 text-gray-500 -mt-9 text-xs">
              pronounced "eye why wall"
            </span>
          </span>
          , LLC and a Director in the Center of Excellence at{" "}
          Instructure (makers of Canvas LMS).
        </p>
        <p>
          I've spent my career in the software and technology space, with the
          last 15 years in educational technology, or EdTech. In that time I've
          worked in a variety of roles and had the opportunity to do some pretty
          cool things like:
        </p>
        <ul>
          <li>Live on two continents, and manage people in five.</li>
          <li>Directly touch &gt; $100M in revenue.</li>
          <li>Launch nearly a dozen new products in global markets.</li>
          <li>
            Scale from &lt; $75 million to over $500 million in revenue.
          </li>
          <li>
            Build teams, tools, processes, technologies, and enablement.
          </li>
        </ul>
        <hr />
        <p>
          If you'd like to chat with me about an idea or a challenge, or just
          want to talk, please{" "}
          <a href="mailto:danny@iywahl.com">reach out</a>. I look forward to
          talking.
        </p>
      </article>
    </>
  );
}
