import { parse } from "$std/flags/mod.ts";
import type { Args } from "$std/flags/mod.ts";

/**
 * Parses command line arguments and returns a parsed object.
 *
 * @param args - An array of command line arguments.
 * @returns - A parsed object containing the command line arguments.
 */

export function parseArguments(args: string[]): Args {
  const stringArgs = [
    "new",
    "snippet",
    "tags",
    "authors",
    "fast",
  ];

  const booleanArgs = [
    "edit",
    "help",
  ];

  const alias = {
    edit: "e",
    help: "h",
    new: "n",
    snippet: "s",
    tags: "t",
    authors: "a",
    fast: "f",
  };

  return parse(args, {
    alias,
    boolean: booleanArgs,
    string: stringArgs,
    stopEarly: false,
    "--": true,
  });
}

function printHelp(): void {
  console.log('Usage: deno task post -n/-f "<title>" [OPTIONS...]');
  console.log("\nOptional flags:");
  console.log("  -h, --help                        Display this help and exit");
  console.log("  -n, --new <title>*                Create a new post <title>");
  console.log("  -s, --snippet  <snippet>          Set the post snippet");
  console.log(
    "  -t, --tags <tag, tag>             Set the tags of the post ",
  );
  console.log(
    "  -a, --authors <author, author>    Set the authors of the post",
  );
  console.log(
    "  -e, --edit                        Edit the post after creation",
  );
  console.log(
    `  -f, --fast <title>*               %cGotta go fast.%c
                                    Create a post with the given title,
                                    and drop into editor immediately.`,
    "background-color: blue; color: white",
    "background-color: inherit; color: inherit",
  );
}

function createPost(
  path: string,
  slug: string,
  fm: string,
  name = "index.md",
): Promise<string> {
  const prefix = path;
  return new Promise((resolve, reject) => {
    Deno.mkdir(`${prefix}${slug}`).then(() => {
      Deno.writeTextFile(`${prefix}${slug}/${name}`, fm).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
    resolve(`${prefix}${slug}/${name}`);
  });
}

async function openEditor(path: string): Promise<void> {
  const editor = Deno.env.get("EDITOR") || "vi";
  console.log("Running: ", [editor, path]);
  const edit = Deno.run({
    cmd: [editor, path],
  });
  await edit.status().then(() => {
    Deno.exit(0);
  });
}

/**
 * Run CLI.
 * @param inputArgs
 */

const getTitle = (title: string | null): string => {
  let t: string | null = title || "";
  if (!t) {
    t = prompt("What is the title of your post?");
    if (!t) {
      console.log("%cYou must provide a title for your post.\n", "color:red");
      t = getTitle(t);
    }
  }
  return t;
};

async function main(inputArgs: string[]): Promise<void> {
  const args = parseArguments(inputArgs);

  type frontMatter = {
    new: string;
    published_at: string | null;
    modified_at: string | null;
    snippet: string | null;
    tags: string | null;
    authors: string | null;
  };

  const meta = {} as frontMatter;

  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  meta.new = args.new;
  meta.published_at = new Date().toISOString();
  meta.modified_at = "";
  meta.snippet = args.snippet;
  meta.tags = args.tags;
  meta.authors = args.authors;

  if (!args.fast) {
    if (!meta.new) {
      meta.new = getTitle(meta.new);
    }
    if (!meta.snippet) meta.snippet = prompt("What is the post snippet?");
    if (!meta.tags) {
      meta.tags = prompt("What are the tags on this post (comma separated)?");
    }
    if (!meta.authors) {
      meta.authors = prompt(
        "Who are the authors of this post (comma separated)?",
      );
    }
  } else {
    meta.snippet = meta.tags = meta.authors = "";
    meta.new = args.fast;
    args.edit = true;
  }

  const slug: string = meta.new.toLowerCase().replace(/\s/g, "-");

  const output = `---
title: ${meta.new}
published_at: ${meta.published_at}
modified_at: ${meta.modified_at}
snippet: ${meta.snippet}
tags: ${meta.tags}
authors: ${meta.authors}
---
\n`;

  await createPost("./routes/blog/posts/", slug, output).then((res) => {
    console.log(`%cPost created at ${res}`, "color: green");
    if (args.edit) {
      openEditor(res);
    } else {
      const edit: string | null = prompt(
        "Would you like to edit it now? Y/n",
      );
      if (edit?.toUpperCase() !== "N") openEditor(res);
    }
  });
}

await main(Deno.args);
