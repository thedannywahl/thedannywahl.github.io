// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $about from "./routes/about.tsx";
import * as $blog from "./routes/blog.tsx";
import * as $blog_slug_ from "./routes/blog/[slug].tsx";
import * as $blog_feed from "./routes/blog/feed.ts";
import * as $blog_index from "./routes/blog/index.tsx";
import * as $feed from "./routes/feed.ts";
import * as $index from "./routes/index.tsx";
import * as $projects from "./routes/projects.tsx";
import * as $Button from "./islands/Button.tsx";
import * as $Carousel from "./islands/Carousel.tsx";
import * as $ColoredButton from "./islands/ColoredButton.tsx";
import * as $DarkMode from "./islands/DarkMode.tsx";
import * as $Input from "./islands/Input.tsx";
import * as $PostCard from "./islands/PostCard.tsx";
import * as $ShareCard from "./islands/ShareCard.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/about.tsx": $about,
    "./routes/blog.tsx": $blog,
    "./routes/blog/[slug].tsx": $blog_slug_,
    "./routes/blog/feed.ts": $blog_feed,
    "./routes/blog/index.tsx": $blog_index,
    "./routes/feed.ts": $feed,
    "./routes/index.tsx": $index,
    "./routes/projects.tsx": $projects,
  },
  islands: {
    "./islands/Button.tsx": $Button,
    "./islands/Carousel.tsx": $Carousel,
    "./islands/ColoredButton.tsx": $ColoredButton,
    "./islands/DarkMode.tsx": $DarkMode,
    "./islands/Input.tsx": $Input,
    "./islands/PostCard.tsx": $PostCard,
    "./islands/ShareCard.tsx": $ShareCard,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
