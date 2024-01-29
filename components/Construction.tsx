import IconTrafficCone from "$icons/traffic-cone.tsx";

export default function Construction() {
  return (
    <div class="flex min-h-[24em] justify-center items-center flex-col gap-8  bg-[#90bdbc] dark:bg-transparent dark:border-2 dark:m-4 lg:rounded-t-xl dark:rounded-xl mb-6 p-4 sm:p-8">
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
        ahold of me by{" "}
        <a href="mailto:danny@iywahl.com" class="text-white">email</a>.
      </p>
    </div>
  );
}
