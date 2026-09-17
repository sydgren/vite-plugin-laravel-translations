// # Import: Vite & Libraries
import { defineConfig, UserConfig } from "vite";
import { builtinModules } from "node:module";
import { resolve } from "node:path";

const NODE_BUILT_IN_MODULES = builtinModules
  .filter((m) => !m.startsWith("_") && ["fs", "fs/promises", "path", "url", "events", "stream", "string_decoder"].includes(m))
  .map((m) => `node:${m}`);

// # Build/Export: Vite Configuration
export default defineConfig(() => {
  // # Return: Configuration
  return {
    build: {
      outDir: "./dist",
      target: "esnext",
      lib: {
        entry: {
          vite: resolve(__dirname, "./src/vite.ts"),
        },
        formats: ["es", "cjs"],
      },
      rolldownOptions: {
        external: [...NODE_BUILT_IN_MODULES, "php-array-reader"],
      },
    },
  } satisfies UserConfig;
});
