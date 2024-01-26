export default function Header() {
  const menus = [
    { page: "Home", href: "/" },
    { page: "About", href: "/about" },
    { page: "Projects", href: "/projects" },
    { page: "Blog", href: "/blog" },
  ];
  return (
    <nav class="flex-none py-4 px-4 sm:py-6 sm:px-8 flex flex-col sm:flex-row lg:mb-8 lg:rounded-xl shadow dark:shadow-none bg-teal-500 dark:bg-gray-800 dark:lg:bg-transparent">
      <div class="flex items-center flex-1">
        <div class="text-4xl sm:text-2xl font-thin text-white dark:text-teal-500 mx-auto sm:mx-0 pb-4 sm:pb-0">
          iyWahl
        </div>
      </div>
      <ul class="flex items-center gap-6 mx-28 sm:mx-0 justify-around">
        {menus.map((menu) => (
          <li>
            <a
              href={menu.href}
              class="hover:underline py-1 aria-[current='page']:font-semibold text-white dark:text-teal-200"
            >
              {menu.page}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
