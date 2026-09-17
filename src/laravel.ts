import { resolve } from "node:path";
import { readFileSync } from "node:fs";

/**
 *	Determine laravel version for language folder.
 *
 * 	@param composerPath string - Path to composer.json file
 * 	@return number - Laravel Version
 */
export const determineLaravelVersion = (composerPath: string = "composer.json"): number => {
  // # Read: composer.json and parse it
  let composer: { require?: Record<string, string> };

  try {
    composer = JSON.parse(readFileSync(composerPath, { encoding: "utf8" }));
  } catch (error) {
    throw new Error(
      `[laravelTranslations] Could not read "${composerPath}" to detect the Laravel version. ` +
        `Run Vite from your Laravel project root, or set the "absoluteLanguageDirectory" option to skip detection. ` +
        `(${(error as Error).message})`,
      { cause: error },
    );
  }

  // # Extract: Laravel framework version using the first (0) index
  const constraint = composer.require?.["laravel/framework"];

  if (!constraint) {
    throw new Error(
      `[laravelTranslations] "${composerPath}" has no "laravel/framework" requirement, so the lang/ directory cannot be located. ` +
        `Set the "absoluteLanguageDirectory" option to point at it directly.`,
    );
  }

  const [laravelVersionString] = constraint.split(".");
  const laravelVersion = parseInt(laravelVersionString.replace(/\D/g, ""));

  if (Number.isNaN(laravelVersion)) {
    throw new Error(
      `[laravelTranslations] Could not read a major version from the "laravel/framework" constraint "${constraint}". ` +
        `Set the "absoluteLanguageDirectory" option to point at your lang/ directory directly.`,
    );
  }

  // # Return: Laravel Version as Integer
  return laravelVersion;
};

/**
 * 	Based on version, return the correct lang/folder path in
 *  absolute form.
 *
 * 	@param laravelVersion number
 * 	@returns string - Absolute path to Laravel lang/ folder
 *
 */
export const getLangDir = (laravelVersion: number = 9): string => (laravelVersion >= 9 ? resolve("lang/") : resolve("resources/lang"));
