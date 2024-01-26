export default function Header() {
  const menus = [
    { page: "Home", href: "/" },
    { page: "About", href: "/about" },
    { page: "Projects", href: "/projects" },
    { page: "Blog", href: "/blog" },
  ];
  return (
    <nav class="bg-teal-500  py-6 px-8 flex flex-col md:flex-row mt-6 mb-8 rounded-xl shadow">
      <div class="flex items-center flex-1">
        <div class="text-2xl ml-1 font-thin text-white">
          iyWahl
        </div>
      </div>
      <ul class="flex items-center gap-6">
        {menus.map((menu) => (
          <li>
            <a
              href={menu.href}
              class="text-white hover:underline py-1 border-gray-500 aria-[current='page']:font-semibold"
            >
              {menu.page}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
