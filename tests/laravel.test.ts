import { determineLaravelVersion, getLangDir } from "../src/laravel";

describe("Laravel feature", () => {
  describe("determineLaravelVersion function", () => {
    it("should return the correct Laravel version", () => {
      // Given
      const expectedVersions = [9, 10, 11];

      // When
      expectedVersions.forEach((version: number) => {
        const composerPath = `tests/fixtures/laravel/composer-v${version}.json`;
        const laravelVersion = determineLaravelVersion(composerPath);

        // Then
        expect(laravelVersion).toBe(version);
      });
    });

    it("should explain what to do when composer.json is missing", () => {
      // Given / When / Then
      expect(() => determineLaravelVersion("tests/fixtures/laravel/does-not-exist.json")).toThrow(/absoluteLanguageDirectory/);
    });

    it("should explain what to do when laravel/framework is not required", () => {
      // Given / When / Then
      expect(() => determineLaravelVersion("tests/fixtures/laravel/composer-without-laravel.json")).toThrow(/laravel\/framework/);
    });
  });

  describe("getLangDir function", () => {
    it("should use lang/ from Laravel 9 onwards", () => {
      // Given / When / Then
      expect(getLangDir(11)).toMatch(/lang$/);
      expect(getLangDir(9)).toMatch(/lang$/);
    });

    it("should use resources/lang before Laravel 9", () => {
      // Given / When / Then
      expect(getLangDir(8)).toMatch(/resources[/\\]lang$/);
    });
  });
});
