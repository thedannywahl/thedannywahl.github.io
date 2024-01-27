import IconTrafficCone from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/traffic-cone.tsx";

export default function Construction() {
  return (
    <div class="flex min-h-[24em] justify-center items-center flex-col gap-8 bg-cover bg-center bg-no-repeat bg-gray-100 dark:bg-transparent dark:border-2 rounded-xl mb-6">
      <div class="space-y-4 text-center">
        <h1 class="text-4xl inline-block font-bold">Oh, hey.</h1>
        <p class="text-xl">
          <IconTrafficCone
            aria-hidden="true"
            class="inline mb-1 pr-1 text-orange-500"
          />This site is currently under construction.
        </p>
      </div>
      <p class="prose dark:prose-invert">
        That felt pretty 90s of me to type, but it's true. You can always get
        ahold of me by <a href="mailto:danny@iywahl.com">email</a>.
      </p>
    </div>
  );
}
