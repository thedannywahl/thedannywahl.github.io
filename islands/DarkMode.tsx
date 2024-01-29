import { useState } from "preact/hooks";
import { Button } from "@/islands/Button.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { Head } from "$fresh/runtime.ts";
import IconSun from "$icons/sun.tsx";
import IconMoon from "$icons/moon.tsx";
import IconSunMoon from "$icons/sun-moon.tsx";

interface DarkModeProps {
  prev: "light" | "dark" | "system";
}

export default function DarkMode(props: DarkModeProps) {
  function getMode(): "light" | "dark" | "system" {
    if (!IS_BROWSER) {
      return props.prev;
    }
    if (localStorage.theme === "dark") {
      return "dark";
    }
    if (localStorage.theme) {
      return "light";
    }
    return "system";
  }

  function updateMode() {
    const w = window as unknown as { isDark: boolean };
    w.isDark = localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: Dark)").matches);
    document.documentElement.classList[w.isDark ? "add" : "remove"]("dark");
  }

  const [mode, setMode] = useState(getMode());

  const setDarkModeOn = () => {
    localStorage.theme = "dark";
    updateMode();
    setMode("dark");
  };

  const setDarkModeAuto = () => {
    localStorage.removeItem("theme");
    updateMode();
    setMode("system");
  };

  const setDarkModeOff = () => {
    localStorage.theme = "light";
    updateMode();
    setMode("light");
  };

  return (
    <div class="flex gap-2 w-full">
      <Button onClick={setDarkModeOn}>
        <IconMoon />
        Force dark
      </Button>

      <Button onClick={setDarkModeAuto}>
        <IconSunMoon />
        System
      </Button>

      <Button onClick={setDarkModeOff}>
        <IconSun />
        Force light
      </Button>
      <div>
        Current Mode: <b class="text-3xl">{mode}</b>
      </div>
    </div>
  );
}
