import { resolve } from "node:path";
import {
  globPattern,
  configureNamespaceIfNeeded,
  translationContentByFileExtension,
  setNestedValue,
  replaceInterpolation,
  buildTranslations,
} from "../src/loader";

describe("Loader feature", () => {
  describe("globPattern function", () => {
    it("should return the glob pattern with JSON files", () => {
      // Given
      const expectedPattern = "**/*.{json,php}";
      const shouldIncludeJson = true;

      // When
      const pattern = globPattern(shouldIncludeJson);

      // Then
      expect(pattern).toBe(expectedPattern);
    });

    it("should return the glob pattern without JSON files", () => {
      // Given
      const expectedPattern = "**/*.php";
      const shouldIncludeJson = false;

      // When
      const pattern = globPattern(shouldIncludeJson);

      // Then
      expect(pattern).toBe(expectedPattern);
    });
  });

  describe("configureNamespaceIfNeeded function", () => {
    it("should return the path split without the namespace", () => {
      // Given
      const expectedPathSplit = ["path", "to", "file"];
      const pathSplit = ["path", "to", "file"];
      const namespace = "";

      // When
      const path = configureNamespaceIfNeeded(pathSplit, namespace);

      // Then
      expect(path).toEqual(expectedPathSplit);
    });

    it("should return the path split with the namespace", () => {
      // Given
      // When the namespace is provided, the path split is ommitted
      const expectedPathSplit = ["path", "namespace", "to", "file"];
      const pathSplit = ["path", "to", "file"];
      const namespace = "namespace";

      // When
      const path = configureNamespaceIfNeeded(pathSplit, namespace);

      // Then
      expect(path).toEqual(expectedPathSplit);
    });
  });

  describe("translationContentByFileExtension function", () => {
    it("should return the translation content for PHP files", async () => {
      // Given
      const fileExtension = ".php";
      const file = "tests/fixtures/translations/translations.php";
      const expectedContent = { key1: "value1", key2: "value2" };

      // When
      const content = await translationContentByFileExtension(fileExtension, file);

      // Then
      expect(content).toEqual(expectedContent);
    });

    it("should return the translation content for JSON files", async () => {
      // Given
      const fileExtension = ".json";
      const file = "tests/fixtures/translations/translations.json";
      const expectedContent = { key1: "value1", key2: "value2" };

      // When
      const content = await translationContentByFileExtension(fileExtension, file);

      // Then
      expect(content).toEqual(expectedContent);
    });

    it("should return the translation content for JSON files at an absolute path", async () => {
      // Given — globSync yields absolute paths in production, which previously broke JSON loading
      const fileExtension = ".json";
      const file = resolve("tests/fixtures/translations/translations.json");
      const expectedContent = { key1: "value1", key2: "value2" };

      // When
      const content = await translationContentByFileExtension(fileExtension, file);

      // Then
      expect(content).toEqual(expectedContent);
    });
  });

  describe("setNestedValue function", () => {
    it("should nest the value under the path", () => {
      // Given
      const pathSplit = ["path", "to", "file"];
      const expectedStructure = { path: { to: { file: { key: "value" } } } };

      // When
      const structure = setNestedValue({}, pathSplit, { key: "value" });

      // Then
      expect(structure).toEqual(expectedStructure);
    });

    it("should keep sibling values already present at the path", () => {
      // Given
      const target = { en: { auth: { failed: "Failed" } } };
      const expectedStructure = { en: { auth: { failed: "Failed" }, validation: { required: "Required" } } };

      // When
      const structure = setNestedValue(target, ["en", "validation"], { required: "Required" });

      // Then
      expect(structure).toEqual(expectedStructure);
    });

    it("should merge when a locale is both a file and a directory", () => {
      // Given — Laravel allows lang/en.json alongside lang/en/auth.php
      const target = { en: { auth: { failed: "Failed" } } };
      const expectedStructure = { en: { auth: { failed: "Failed" }, "Welcome!": "Velkommen!" } };

      // When
      const structure = setNestedValue(target, ["en"], { "Welcome!": "Velkommen!" });

      // Then
      expect(structure).toEqual(expectedStructure);
    });
  });

  describe("replaceInterpolation function", () => {
    const interpolation = { prefix: "{{", suffix: "}}" };

    it("should return the object structure with the new interpolation", () => {
      // Given
      const object = { key: "{{value}}" };
      const expectedObject = { key: "{{value}}" };

      // When
      const newObject = replaceInterpolation(object, interpolation);

      // Then
      expect(newObject).toEqual(expectedObject);
    });

    it("should rewrite Laravel placeholders in string values", () => {
      // Given
      const object = { greeting: "Welcome :name", nested: { bye: "Bye :name" } };
      const expectedObject = { greeting: "Welcome {{name}}", nested: { bye: "Bye {{name}}" } };

      // When
      const newObject = replaceInterpolation(object, interpolation);

      // Then
      expect(newObject).toEqual(expectedObject);
    });

    it("should leave non-string values untouched", () => {
      // Given — serialising the whole tree used to produce invalid JSON here
      const object = { count: 5, enabled: true, missing: null, list: [1, "Hi :name"] };
      const expectedObject = { count: 5, enabled: true, missing: null, list: [1, "Hi {{name}}"] };

      // When
      const newObject = replaceInterpolation(object, interpolation);

      // Then
      expect(newObject).toEqual(expectedObject);
    });

    it("should not mistake time-like strings for placeholders", () => {
      // Given
      const object = { openingHours: "Open at 12:30" };
      const expectedObject = { openingHours: "Open at 12:30" };

      // When
      const newObject = replaceInterpolation(object, interpolation);

      // Then
      expect(newObject).toEqual(expectedObject);
    });
  });

  describe("buildTranslations function", () => {
    it("should return the translations object using namespace", async () => {
      // Given
      const absLangPath = "tests/fixtures/translations";
      const pluginConfiguration = {
        includeJson: true,
        namespace: "testingNamespace",
      };
      const expectedTranslations = {
        // This is the namespace
        translations: {
          testingNamespace: {
            key1: "value1",
            key2: "value2",
          },
        },
        // This is the namespace
        "translations-for-build-test-json": {
          testingNamespace: {
            key: "Value",
            "another-key": "Another value",
          },
        },
        // This is the namespace
        "translations-for-build-test-php": {
          testingNamespace: {
            "key-from-php": "value-from-php",
            "php-key": "php",
          },
        },
      };

      // When
      const translations = await buildTranslations(absLangPath, pluginConfiguration);

      // Then
      expect(translations).toEqual(expectedTranslations);
    });
  });

  describe("buildTranslations function without namespace", () => {
    it("should return the translations object without using namespace", async () => {
      // Given
      const absLangPath = "tests/fixtures/translations";
      const pluginConfiguration = {
        includeJson: true,
      };
      const expectedTranslations = {
        // This is the namespace
        translations: {
          key1: "value1",
          key2: "value2",
        },
        // This is the namespace
        "translations-for-build-test-json": {
          key: "Value",
          "another-key": "Another value",
        },
        // This is the namespace
        "translations-for-build-test-php": {
          "key-from-php": "value-from-php",
          "php-key": "php",
        },
      };

      // When
      const translations = await buildTranslations(absLangPath, pluginConfiguration);

      // Then
      expect(translations).toEqual(expectedTranslations);
    });
  });
});
