import { type PageProps } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";
import Header from "../components/Header.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>iywahl.com</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body f-client-nav class="w-full max-w-screen-lg mx-auto bg-gray">
        <Header />
        <Partial name="body">
          <Component />
        </Partial>
      </body>
    </html>
  );
}
