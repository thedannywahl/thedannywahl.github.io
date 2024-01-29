import { type PageProps } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import Construction from "@/components/Construction.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>iyWahl | I break things.</title>
        <link rel="stylesheet" href="/styles.css" />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/blog/feed"
          title="Subscribe to iyWahl blog"
        />
      </head>
      <body
        f-client-nav
        class="w-full max-w-screen-lg mx-auto bg-gradient-to-br from-slate-200 to-slate-300 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950"
      >
        <div id="app" class="flex flex-col min-h-dvh">
          <header class="lg:pt-6">
            <Header />
          </header>
          <main class="flex-1 bg-white dark:bg-gray-800 shadow dark:shadow-none h-full w-full lg:rounded-t-xl dark:text-gray-200">
            <Partial name="main">
              <Construction />
              <Component />
            </Partial>
          </main>
          <footer class="lg:pb-8">
            <Footer />
          </footer>
        </div>
      </body>
    </html>
  );
}
