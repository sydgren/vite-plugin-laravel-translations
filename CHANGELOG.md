# Changelog

## [2.0.0](https://github.com/sydgren/vite-plugin-laravel-translations/compare/vite-plugin-laravel-translations-v1.0.0...vite-plugin-laravel-translations-v2.0.0) (2026-06-15)


### ⚠ BREAKING CHANGES

* requires Vite 8 and Node 24; package renamed; useGlobalVar removed.

### Features

* added `assertJsonImport` to force the assert json type when import `.json` files ([a0c4559](https://github.com/sydgren/vite-plugin-laravel-translations/commit/a0c4559d0902e5fde38fe41331c542af8d8771bf))
* added documentation for `Asserting JSON Imports` section ([5ca9f55](https://github.com/sydgren/vite-plugin-laravel-translations/commit/5ca9f55c66a75f2d8d462f52458a9dc3dbfeea56))
* added github action workflow to test the modules ([4556048](https://github.com/sydgren/vite-plugin-laravel-translations/commit/4556048f3611fc67ca08f74d845630b975c731d9))
* added tests for `loader` module ([9417397](https://github.com/sydgren/vite-plugin-laravel-translations/commit/94173971525a4c7b8b58748d1aa6bf52d26915a1))
* added tests for `utils` module ([fb06cf7](https://github.com/sydgren/vite-plugin-laravel-translations/commit/fb06cf7a6469d4ad6a97eb677966979a2ea30b89))
* Added the flexible language path in `TranslationConfiguration` ([5e21feb](https://github.com/sydgren/vite-plugin-laravel-translations/commit/5e21feb1c7b959ee510a77003262f1c9ddadf711))
* installed `jest` dependency ([e6601c7](https://github.com/sydgren/vite-plugin-laravel-translations/commit/e6601c709bf5e1faac4798762ee7f5d7be842a21))
* rebuild for Vite 8 (Rolldown) and rename to [@sydgren](https://github.com/sydgren) scope ([c91fb61](https://github.com/sydgren/vite-plugin-laravel-translations/commit/c91fb61c3be6b0b741d27fe12358c6d2612ed109))
* **tests:** added tests for `laravel` module ([6005151](https://github.com/sydgren/vite-plugin-laravel-translations/commit/6005151a4a41d24d04820c17619a07d2dfa98bb3))
* Updated the README file to add the `absoluteLanguageDirectory` param ([53dea1d](https://github.com/sydgren/vite-plugin-laravel-translations/commit/53dea1d0e4a89f6cbd73855a3af2e503a6c72ceb))
* Vite Env, Github Workflows & Updates ([26a48e3](https://github.com/sydgren/vite-plugin-laravel-translations/commit/26a48e3d77e961baac787a294c6a1a4cb89760f8))
* Vite Env, Github Workflows & Updates ([7618f1b](https://github.com/sydgren/vite-plugin-laravel-translations/commit/7618f1b2562930d8efb85aad4fa439730ec7c99c))


### Bug Fixes

* `includeJson` not working ([3501d08](https://github.com/sydgren/vite-plugin-laravel-translations/commit/3501d08a7e6463781b29fbb679100c9492bbc310))
* `includeJson` not working ([cc4bd82](https://github.com/sydgren/vite-plugin-laravel-translations/commit/cc4bd828799b62ba5c2e54c5a106d82e758bfb2c))
* issue with types ([74b512b](https://github.com/sydgren/vite-plugin-laravel-translations/commit/74b512b8a808e6ee1d8718a6409e6b324490c399))
* pull changes by `@PadowYT2` in [#47](https://github.com/sydgren/vite-plugin-laravel-translations/issues/47) ([3c5f412](https://github.com/sydgren/vite-plugin-laravel-translations/commit/3c5f4124b0138822489663fdb1d98b3377a55994))
* Unawaited import ([285ab53](https://github.com/sydgren/vite-plugin-laravel-translations/commit/285ab538f5d780f7f412f919cdcf90b118ff512d))
* utility import in `loader.ts` ([c703d81](https://github.com/sydgren/vite-plugin-laravel-translations/commit/c703d81287e2562fae4845fa6d3f86f1e2f9fb11))

## Release v0.3.0 - Vite Env, Github Workflows & Updates

- Fixed issue with `mergeDeep` function when importing `.json` files using `pnpm`
- Updated project to use latest `NPM` packages
- Updated `eslint` and `prettier` configurations
- Updated package to use `vite` for `build` process
- Added new plugin variable `useGlobalVar` for backwards compatiblity
- Added `Github Actions` workflows for `CI/CD` pipeline builds
- Added `dependabot` configuration for staying updated
- Prepare for versioning with `semantic-release`

</br>

### Breaking Changes

- Switched `LARAVEL_TRANSLATIONS` to use `import.meta.env` as `VITE_LARAVEL_TRANSLATIONS`:

  ```js
  // app.js
  // 1. Create i18n instance with options
  const i18n = VueI18n.createI18n({
    locale: "ja", // set locale
    fallbackLocale: "en", // set fallback locale
    messages: import.meta.env.VITE_LARAVEL_TRANSLATIONS, // set locale messages
    // If you need to specify other options, you can set other options
    // ...
  });
  ```

  Please now use `import.meta.env.VITE_LARAVEL_TRANSLATIONS` instead of `LARAVEL_TRANSLATIONS` in your project or add the following to your `vite.config.ts`:

  ```js
  import laravelTranslations from 'vite-plugin-laravel-translations';

  export default defineConfig({
  	...
  	plugins: [
  		laravelTranslations({
  			// # Backwards compatibility for `LARAVEL_TRANSLATIONS`
  			useGlobalVar: true,
  		}),
  	],
  });
  ```
