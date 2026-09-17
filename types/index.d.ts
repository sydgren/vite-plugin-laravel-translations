/**
 * ------------------------------------------------
 *  # Declare: Package Definitions
 * ------------------------------------------------
 */

import type { Plugin } from "vite";

export declare interface TranslationConfiguration {
  namespace?: string | false;
  includeJson?: boolean;
  /** @deprecated No longer used — JSON files are now read directly, so no import assertion is needed. */
  assertJsonImport?: boolean;
  absoluteLanguageDirectory?: string | null; // Optional param to override default langDir if needed
  interpolation?: InterpolationConfiguration | null;
}

export declare interface InterpolationConfiguration {
  prefix: string;
  suffix: string;
}

// Define the translation content interpolable type
export declare type TranslationContentInterpolable = {
  pluginConfiguration: TranslationConfiguration;
  fileExtension: string;
  file: string;
};

// # Define: laravelTranslations function (optional return)
declare function laravelTranslations(pluginConfiguration?: TranslationConfiguration): Plugin;
export default laravelTranslations;
