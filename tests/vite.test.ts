import { resolve } from "node:path";
import { vi } from "vitest";
import type { HmrContext } from "vite";
import laravelTranslations from "../src/vite";

const LANG_DIR = resolve("tests/fixtures/translations");

const hmrContextFor = (file: string) => {
  const restart = vi.fn();

  return { restart, context: { file, server: { restart } } as unknown as HmrContext };
};

describe("Vite plugin", () => {
  it("should expose the plugin name", () => {
    // Given / When
    const plugin = laravelTranslations({ absoluteLanguageDirectory: LANG_DIR });

    // Then
    expect(plugin.name).toBe("laravelTranslations");
  });

  it("should define the translations on import.meta.env", () => {
    // Given
    const plugin = laravelTranslations({ absoluteLanguageDirectory: LANG_DIR });

    // When
    const config = (plugin.config as () => { define: Record<string, object> })();

    // Then
    expect(config.define["import.meta.env.VITE_LARAVEL_TRANSLATIONS"]).toEqual({
      translations: { key1: "value1", key2: "value2" },
      "translations-for-build-test-php": { "key-from-php": "value-from-php", "php-key": "php" },
    });
  });

  it("should include JSON translations when configured", () => {
    // Given
    const plugin = laravelTranslations({ absoluteLanguageDirectory: LANG_DIR, includeJson: true });

    // When
    const config = (plugin.config as () => { define: Record<string, object> })();

    // Then
    expect(config.define["import.meta.env.VITE_LARAVEL_TRANSLATIONS"]).toHaveProperty("translations-for-build-test-json");
  });

  describe("handleHotUpdate", () => {
    const triggerUpdate = (file: string, includeJson = false) => {
      const plugin = laravelTranslations({ absoluteLanguageDirectory: LANG_DIR, includeJson });
      const { restart, context } = hmrContextFor(file);

      (plugin.handleHotUpdate as (context: HmrContext) => void)(context);

      return restart;
    };

    it("should restart the server for PHP files in the language directory", () => {
      // Given / When
      const restart = triggerUpdate(`${LANG_DIR}/en/auth.php`);

      // Then
      expect(restart).toHaveBeenCalled();
    });

    it("should restart for a custom language directory outside lang/", () => {
      // Given — the previous hardcoded `lang/` match never fired for custom directories
      // When
      const restart = triggerUpdate(`${LANG_DIR}/nested/deeply/auth.php`);

      // Then
      expect(restart).toHaveBeenCalled();
    });

    it("should ignore JSON files unless includeJson is set", () => {
      // Given / When
      const restart = triggerUpdate(`${LANG_DIR}/en.json`);

      // Then
      expect(restart).not.toHaveBeenCalled();
    });

    it("should restart for JSON files when includeJson is set", () => {
      // Given / When
      const restart = triggerUpdate(`${LANG_DIR}/en.json`, true);

      // Then
      expect(restart).toHaveBeenCalled();
    });

    it("should ignore files outside the language directory", () => {
      // Given / When
      const restart = triggerUpdate(resolve("src/vite.ts"));

      // Then
      expect(restart).not.toHaveBeenCalled();
    });

    it("should ignore non-translation files inside the language directory", () => {
      // Given / When
      const restart = triggerUpdate(`${LANG_DIR}/README.md`);

      // Then
      expect(restart).not.toHaveBeenCalled();
    });
  });
});
