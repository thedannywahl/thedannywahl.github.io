import { type Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import typography from "npm:@tailwindcss/typography@0.5.10";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: "#6ba7a5",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
          },
        },
      },
    },
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
    typography,
  ],
} satisfies Config;
