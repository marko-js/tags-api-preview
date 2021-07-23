# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.0.0 (2021-07-23)


### Features

* add api util ([55b7ee5](https://github.com/marko-js/tags-api-preview/commit/55b7ee5919696c8c2a73fb7e8a14cdf179303119))
* add assertions for invalid assignments ([9745982](https://github.com/marko-js/tags-api-preview/commit/974598283d13ba28a914a19f7854f8aa0150962b))
* add compile error for hoisted tag var assignment ([74cdbca](https://github.com/marko-js/tags-api-preview/commit/74cdbca9cfe87a7f63cc9cd6a6028a579c775357))
* add default change handler to let tag ([6ca5580](https://github.com/marko-js/tags-api-preview/commit/6ca5580e1a75baa193f89a8bd2986c8769c02159))
* add lifecycle tag ([fc5a8e3](https://github.com/marko-js/tags-api-preview/commit/fc5a8e379ce082bcd4f35ee4ef0cc442e8775cb3))
* add props tag ([58b07d7](https://github.com/marko-js/tags-api-preview/commit/58b07d7b10b9ea5041d57e73a624a3f1b8479864))
* add runtime for native tag getter ([3988064](https://github.com/marko-js/tags-api-preview/commit/39880643fbbfa10c4e00e3d6baddadb28084504d))
* add tags api comment directive ([3bc0ab8](https://github.com/marko-js/tags-api-preview/commit/3bc0ab89b848aa0f7ba5a9d532cae318325402fd))
* disallow sync refs inside body content ([4ffac6b](https://github.com/marko-js/tags-api-preview/commit/4ffac6b35bbf52ee6fce84181248fe034d5fd3be))
* dynamic tag default attr support ([ae9eb1d](https://github.com/marko-js/tags-api-preview/commit/ae9eb1dbbd952bf55c45945e2fec2345e9000ac8))
* implement tag tag ([adf035c](https://github.com/marko-js/tags-api-preview/commit/adf035cb1962a8f8e586b5f5d2cca1d5ce6c0f66))
* improve id tag errors ([64c5448](https://github.com/marko-js/tags-api-preview/commit/64c54484da8dbd2c5779acbbb509e1223a45815e))
* make get assignable ([9251e06](https://github.com/marko-js/tags-api-preview/commit/9251e0678c0a37937aa858de0768b286e9f39c8c))
* optimize ssr function cache impl to noop ([f073b0e](https://github.com/marko-js/tags-api-preview/commit/f073b0ef7848bb2c951a69f27c8c14fd90663bc7))
* reduce output code for cached functions ([37c8c15](https://github.com/marko-js/tags-api-preview/commit/37c8c155ab936887b420ab43159a1d4e3170126b))
* refactor change handlers, add tests ([3c2e2bd](https://github.com/marko-js/tags-api-preview/commit/3c2e2bd7f8656beddf8e56dcb06534ba034b01b0))
* refactor hoisting to be more generic ([84d7eaf](https://github.com/marko-js/tags-api-preview/commit/84d7eaf7d7c84908f4615fbe5b23a1c534d7f95c))
* refactor return tag, add more tests ([db0e549](https://github.com/marko-js/tags-api-preview/commit/db0e549e9e09cd50cc019131f013f1f7bc319ca7))
* refactor to have stable tag var identifiers ([45fe5df](https://github.com/marko-js/tags-api-preview/commit/45fe5df80bc22b2cdefbaafcdb1247e6ad838137))
* support binding shorthand ([2f92274](https://github.com/marko-js/tags-api-preview/commit/2f9227443b81a0acb287ca672f5cb77a2f9352e0))
* support inline style tag ([f027020](https://github.com/marko-js/tags-api-preview/commit/f0270202f99295c685c62fd1fe14419dcd3412f1))
* support spreading event handlers for native tags ([298c45c](https://github.com/marko-js/tags-api-preview/commit/298c45c2e4e1bf9a3f506cad7523a75024c05064))
* switch to cached function deps implementation ([567a535](https://github.com/marko-js/tags-api-preview/commit/567a535b867cd60c713ca9bd016cf49de2b90e1a))
* tags/class api feature detection ([7fe5cb8](https://github.com/marko-js/tags-api-preview/commit/7fe5cb8ae8199c91df4d0e337ba21273dcce0d7c))
* use template globals as feature detection ([0d40eaa](https://github.com/marko-js/tags-api-preview/commit/0d40eaa9d7b97a1da2e0bd6041db05fd1409b06e))
* warn about using dynamic tag with arguments in tags api ([94fe946](https://github.com/marko-js/tags-api-preview/commit/94fe946d6ff5eba40ffd24ea8680e47375874ec7))
* wip call change functions on assigmment ([0354db6](https://github.com/marko-js/tags-api-preview/commit/0354db676d486e9fab2923db38c1796b001bdc92))
* wip return tag ([93c693d](https://github.com/marko-js/tags-api-preview/commit/93c693d9e1cac04b066e426bcf90d491d0889596))
* wip support native tag bindings ([79b19bd](https://github.com/marko-js/tags-api-preview/commit/79b19bdb08a2c69259a2ec49d949990643abd34c))


### Bug Fixes

* ensure props at root of template ([71680f0](https://github.com/marko-js/tags-api-preview/commit/71680f00113566fb511c7da29a4f850c825d44fa))
* formatting/linting issues ([c797c5c](https://github.com/marko-js/tags-api-preview/commit/c797c5c2085ecbef1372d64514268b5fc04c5acb))
* hoisting implementation ([a483119](https://github.com/marko-js/tags-api-preview/commit/a48311961dec8c2c00d7de86b7becdfa8397a42e))
* hoisting issues, add tests ([00a5aaa](https://github.com/marko-js/tags-api-preview/commit/00a5aaa799010aff5b7d967541c7cca321cd89f5))
* invalid ts type ([8c02987](https://github.com/marko-js/tags-api-preview/commit/8c02987b3950e987da79a6494b9e450259569904))
* issue with destructuring loop params ([91784a5](https://github.com/marko-js/tags-api-preview/commit/91784a51de2a6bd501fcd4ec9a239dceebca751f))
* issue with nested cached function not tracking dep ([d36a0d8](https://github.com/marko-js/tags-api-preview/commit/d36a0d8865f865a01f5f44014d52f7d17e112fcc))
* lifecycle tag, add basic test ([6c64d78](https://github.com/marko-js/tags-api-preview/commit/6c64d78718b96a1b4dee10bf6c749330b9c86a2e))
* native tag event handlers with spread ([c1ced4e](https://github.com/marko-js/tags-api-preview/commit/c1ced4e18a5170b7f6e5fd88feb98d4c5ee4eeda))
* native tag vars ([25f6494](https://github.com/marko-js/tags-api-preview/commit/25f6494a7e9a12f531e7a35fc07e984f917bf3e8))
* prevent multiple props tags ([9be91f4](https://github.com/marko-js/tags-api-preview/commit/9be91f462a242b2da940c6e882cac8e8aef390d3))
