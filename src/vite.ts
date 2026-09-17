import { sep } from "node:path";
import { determineLaravelVersion, getLangDir } from "./laravel";
import { buildTranslations } from "./loader";
import type { TranslationConfiguration } from "../types";
import type { HmrContext, Plugin } from "vite";

/** Vite reports watched files with posix separators, so compare on those. */
const toPosixPath = (path: string): string => (sep === "/" ? path : path.replaceAll(sep, "/"));

export default function laravelTranslations(pluginConfiguration: TranslationConfiguration = {}): Plugin {
  // # Merge: Configurations over the defaults
  const configuration: TranslationConfiguration = {
    namespace: false,
    includeJson: false,
    absoluteLanguageDirectory: null,
    ...pluginConfiguration,
  };

  // # Retrieve: Laravel Path (Absolute)
  const absPathForLangDir = configuration.absoluteLanguageDirectory || getLangDir(determineLaravelVersion());

  // # Determine: Which files an HMR update should restart the server for
  const watchedDirectory = toPosixPath(absPathForLangDir);
  const watchedExtensions = configuration.includeJson ? [".php", ".json"] : [".php"];

  return {
    // # Define: Plugin Name for Vite
    name: "laravelTranslations",

    // # Plugin: Configuration Hook (like construct)
    config() {
      // # Assign: Translations as import.meta.env.VITE_LARAVEL_TRANSLATIONS
      return {
        define: {
          "import.meta.env.VITE_LARAVEL_TRANSLATIONS": buildTranslations(absPathForLangDir, configuration),
        },
      };
    },

    handleHotUpdate(context: HmrContext) {
      const file = toPosixPath(context.file);

      // # Trigger: Server Restart to pick up changes on file match
      if (file.startsWith(`${watchedDirectory}/`) && watchedExtensions.some((extension) => file.endsWith(extension))) {
        context.server.restart();
      }
    },
  };
}
