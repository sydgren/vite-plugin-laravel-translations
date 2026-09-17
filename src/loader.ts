import { globSync, readFileSync } from "node:fs";
import { join, extname, sep } from "node:path";
import { fromString } from "php-array-reader";
import { mergeDeep } from "./utils/mergeDeep";
import { TranslationConfiguration, InterpolationConfiguration, TranslationContentInterpolable } from "../types/index";

/**
 * Laravel placeholders are `:name`. Requiring a leading letter or underscore
 * keeps time-like values such as "12:30" from being mistaken for placeholders.
 */
const LARAVEL_PLACEHOLDER = /:([a-zA-Z_]\w*)/g;

/**
 * Get the glob pattern based on the configuration
 *
 * @param shouldIncludeJson - Should include JSON files
 * @returns string - The glob pattern
 */
export const globPattern = (shouldIncludeJson: boolean): string => (shouldIncludeJson ? "**/*.{json,php}" : "**/*.php");

/**
 * Configure the namespace for the path split
 *
 * @param pathSplit - The path split
 * @param namespace - The namespace
 * @returns string[] - The path split with the namespace
 */
export const configureNamespaceIfNeeded = (pathSplit: string[], namespace?: string | null | false): string[] => {
  if (namespace && namespace.length > 0) {
    pathSplit.splice(1, 0, namespace);
  }

  return pathSplit;
};

/**
 * Get the translation content by file extension
 *
 * @param fileExtension - The file extension
 * @param file - The file path
 * @returns object - The translation content
 */
export const translationContentByFileExtension = (fileExtension: string, file: string): object => {
  const contents = readFileSync(file, "utf8");

  return fileExtension === ".php" ? fromString(contents) : JSON.parse(contents);
};

/**
 * Write a value at a nested path, merging when the path already holds content.
 *
 * Laravel allows a locale to be both a file and a directory (`lang/en.json`
 * alongside `lang/en/auth.php`), so an occupied leaf is merged, not replaced.
 *
 * @param target - The object to write into
 * @param path - The path segments to nest the value under
 * @param value - The value to place at the leaf
 * @returns object - The target, mutated
 */
export const setNestedValue = (target: Record<string, unknown>, path: string[], value: unknown): object => {
  const leafKey = path[path.length - 1];

  const parent = path.slice(0, -1).reduce<Record<string, unknown>>((node, key) => {
    const child = node[key];

    if (!child || typeof child !== "object") {
      node[key] = {};
    }

    return node[key] as Record<string, unknown>;
  }, target);

  parent[leafKey] = leafKey in parent ? mergeDeep(parent[leafKey], value) : value;

  return target;
};

/**
 * Replace the interpolation with provided prefix and suffix
 *
 * Walks the structure so only string values are rewritten — serialising the
 * whole tree would corrupt numeric values and other non-string content.
 *
 * @param value - The object structure
 * @param interpolation - An object with prefix and suffix to be used by interpolation
 * @returns - The object structure with the new interpolation
 */
export const replaceInterpolation = (value: unknown, interpolation: InterpolationConfiguration): unknown => {
  if (typeof value === "string") {
    return value.replace(LARAVEL_PLACEHOLDER, `${interpolation.prefix}$1${interpolation.suffix}`);
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceInterpolation(item, interpolation));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceInterpolation(item, interpolation)]));
  }

  return value;
};

/**
 * Fetches and builds the translations from the Laravel lang/ directory
 *
 * @param absLangPath - The absolute path to Laravel lang/ directory
 * @param pluginConfiguration - Plugin configurations
 * @returns translations - Object/JSON version of Laravel Translations
 */
export const buildTranslations = (absLangPath: string, pluginConfiguration: TranslationConfiguration): object => {
  // Define the language directory
  const langDir = pluginConfiguration.absoluteLanguageDirectory || absLangPath;

  // Fetch filenames, relative to the language directory
  const files = globSync(globPattern(pluginConfiguration.includeJson || false), { cwd: langDir });

  // Create translations object
  return files.reduce<Record<string, unknown>>((translations, file) => {
    // Extract the file extension and the path it should nest under
    const fileExtension = extname(file);
    const pathSplit = file.slice(0, -fileExtension.length || undefined).split(sep);

    // Build the translation content and nest it under its path
    const translationContent = buildContentInterpolation({
      file: join(langDir, file),
      fileExtension,
      pluginConfiguration,
    });

    return setNestedValue(translations, configureNamespaceIfNeeded(pathSplit, pluginConfiguration.namespace), translationContent) as Record<string, unknown>;
  }, {});
};

/**
 * Adds interpolation to the translation content
 *
 * @param file - The translation file
 * @param fileExtension - The translation file type/ext
 * @param pluginConfiguation - Extension configuration settings
 * @returns object - The translation content with interpolation
 */
const buildContentInterpolation = ({ file, fileExtension, pluginConfiguration }: TranslationContentInterpolable): object => {
  // # Fetch: Translation content
  const translationContent = translationContentByFileExtension(fileExtension, file);

  return pluginConfiguration.interpolation?.prefix && pluginConfiguration.interpolation?.suffix
    ? (replaceInterpolation(translationContent, pluginConfiguration.interpolation) as object)
    : translationContent;
};
