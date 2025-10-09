import nextPlugin from "eslint-config-next";

const eslintConfig = [
  nextPlugin,
  {
    rules: {
      // You can add custom rules here if needed
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
