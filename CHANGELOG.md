# @marko/tags-api-preview

## 0.6.1

### Patch Changes

- 9c703ff: Fix incorrect Marko peerDependency.

## 0.6.0

### Minor Changes

- 3d36e82: Allow using top level input rather than just <attrs/> tag.
- 3d36e82: Switch to new default attribute name (value instead of default).
- 3d36e82: Member expressions now are accounted for when determining function dependencies.

## 0.5.8

### Patch Changes

- d11e8f7: Pin peerDependency to current version of Marko.

## 0.5.7

### Patch Changes

- 2cad83d: Fixes an issue where effects with no dependencies were running with each render instead of once.

## 0.5.6

### Patch Changes

- 95a14eb: Fix issue when loading the compiler hooks from native esm by avoiding \_\_dirname.

## 0.5.5

### Patch Changes

- 4029122: Fix issue where `_return` (used internally) was not registered as a taglib attribute

## 0.5.4

### Patch Changes

- e7c77b3: Allow missing default attribute for let tag.

## 0.5.3

### Patch Changes

- 18c9cc3: Rename publish script to release in order to avoid a double publish in the CI

## 0.5.2

### Patch Changes

- 51f624b: Attempt to fix issue with gh releases not being generated.
