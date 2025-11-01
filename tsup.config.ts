import { defineConfig } from "tsup";

export default defineConfig({
  name: "kaia-connector",
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  dts: {
    compilerOptions: {
      incremental: false,
    },
  },
  clean: true,
  treeshake: true,
  external: ["@wagmi/core", "wagmi", "viem", "caver-js"],
});
