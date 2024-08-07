# @marko/tags-api-preview

## 0.7.6

### Patch Changes

- 97ec7db: Fix issue with cached values inside attribute tags.

## 0.7.5

### Patch Changes

- 8b85ca8: Fix const reassignment when using the let tag and spread attributes

## 0.7.4

### Patch Changes

- fd6ba01: Fix "Unused '@ts-expect-error' directive" compilation error when noUnusedParameters is false

## 0.7.3

### Patch Changes

- 87c09f8: Improve get tag type by accepting an optional type parameter that specifies the returned value type

## 0.7.2

### Patch Changes

- d6f4d64: Fix incorrect types for the get/set tags.

## 0.7.1

### Patch Changes

- 49637c2: improve member expression caching

## 0.7.0

### Minor Changes

- b6bc25d: Improve caching to be more like Marko 6. Fixes an issue with conditionally caching functions.

## 0.6.2

### Patch Changes

- 862b41b: Add typescript types.

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
