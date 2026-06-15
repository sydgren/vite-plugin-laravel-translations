/**
 * ------------------------------------------------
 *  # Import: Dependencies
 * ------------------------------------------------
 */
import { determineLaravelVersion, getLangDir } from "./laravel";
import { buildTranslations } from "./loader";
import type { TranslationConfiguration } from "../types";
import type { HmrContext } from "vite";

/**
 * ------------------------------------------------
 *  # Setup: Main Function
 * ------------------------------------------------
 */
export default async function laravelTranslations(pluginConfiguration: TranslationConfiguration = {}) {
  // # Define: Default Configurations
  const defaultConfigurations: TranslationConfiguration = {
    namespace: false,
    includeJson: false,
    assertJsonImport: false,
    absoluteLanguageDirectory: null,
  };

  // # Retrieve: Laravel Path (Absolute)
  const absPathForLangDir = pluginConfiguration.absoluteLanguageDirectory || getLangDir(determineLaravelVersion());

  return {
    // # Define: Plugin Name for Vite
    name: "laravelTranslations",

    // # Plugin: Configuration Hook (like construct)
    async config() {
      // # Merge: Configurations
      pluginConfiguration = Object.assign({}, defaultConfigurations, pluginConfiguration);

      // # Assign: Translations as import.meta.env.VITE_LARAVEL_TRANSLATIONS
      return {
        define: {
          "import.meta.env.VITE_LARAVEL_TRANSLATIONS": await buildTranslations(absPathForLangDir, pluginConfiguration),
        },
      };
    },
    handleHotUpdate(context: HmrContext) {
      // # Determine: Regex to match based on configurations
      const fileMatchRegex = pluginConfiguration.includeJson ? /lang\/.*\.(?:php|json)$/ : /lang\/.*\.php$/;

      // # Trigger: Server Restart to pick up changes on file match
      if (fileMatchRegex.test(context.file)) {
        context.server.restart();
      }
    },
  };
}
