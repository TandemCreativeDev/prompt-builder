export const presets = [
  ["@babel/preset-env", { targets: { node: "current" } }],
  "@babel/preset-typescript",
];
export const env = {
  test: {
    presets: [
      ["@babel/preset-env", { targets: { node: "current" } }],
      "@babel/preset-typescript",
    ],
  },
};
