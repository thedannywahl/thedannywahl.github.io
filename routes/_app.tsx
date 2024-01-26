import { type PageProps } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>iywahl.com</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body
        f-client-nav
        class="w-full max-w-screen-lg mx-auto bg-slate-200 dark:bg-slate-800"
      >
        <Header />
        <main class="px-4 py-8 mx-auto bg-white dark:bg-slate-200">
          <Partial name="body">
            <Component />
          </Partial>
        </main>
        <Footer />
      </body>
    </html>
  );
}
