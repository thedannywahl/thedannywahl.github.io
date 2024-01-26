export default function Header() {
  const menus = [
    { page: "Home", href: "/" },
    { page: "About", href: "/about" },
    { page: "Projects", href: "/projects" },
    { page: "Blog", href: "/blog" },
  ];
  return (
    <nav class="py-6 px-8 flex flex-col md:flex-row mt-6 mb-8 rounded-xl shadow bg-teal-500 dark:bg-teal-900">
      <div class="flex items-center flex-1">
        <div class="text-2xl ml-1 font-thin text-white dark:text-teal-200">
          iyWahl
        </div>
      </div>
      <ul class="flex items-center gap-6">
        {menus.map((menu) => (
          <li>
            <a
              href={menu.href}
              class="hover:underline py-1 aria-[current='page']:font-semibold text-white dark:text-teal-100"
            >
              {menu.page}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
