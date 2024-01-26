import { type Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ addVariant, addComponents }) => {
      addVariant("children", "& > *");
      addVariant("children-all", "& *");
      addComponents({
        ".debug": {
          border: "1px dashed red",
        },
      });
    }),
  ],
} satisfies Config;
