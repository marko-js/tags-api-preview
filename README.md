<h1 align="center">
  <!-- Logo -->
  <br/>
  @marko/tags-api-preview (DEPRECATED: marko 5 includes tags api interop by default)
	<br/>

  <!-- CI -->
  <a href="https://github.com/marko-js/tags-api-preview/actions/workflows/ci.yml">
    <img src="https://github.com/marko-js/tags-api-preview/actions/workflows/ci.yml/badge.svg" alt="Build status"/>
  </a>
  <!-- Coverage -->
  <a href="https://codecov.io/gh/marko-js/tags-api-preview">
    <img src="https://codecov.io/gh/marko-js/tags-api-preview/branch/main/graph/badge.svg?token=TODO"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/@marko/tags-api-preview">
    <img src="https://img.shields.io/npm/v/@marko/tags-api-preview.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@marko/tags-api-preview">
    <img src="https://img.shields.io/npm/dm/@marko/tags-api-preview.svg" alt="Downloads"/>
  </a>
</h1>

A glimpse into the future of Marko.

For more information, check out [the announcement article](https://dev.to/ryansolid/introducing-the-marko-tags-api-preview-37o4)!

# Installation

```console
npm install @marko/tags-api-preview
```

After installing the `tags-api-preview` in your project, you can immediately start using new tags and features.
You can use "tags api" templates along side your existing "class api" templates. A [set of heuristics](#heuristics) is used to determine if the "tags api" should be enabled.

# Examples

```marko
<let/count=0 />

<div>${count}</div>
<button onClick() { count++ }>
  Click me!
</button>
```

```marko
<let/count=0 />
<effect() { document.title = `You clicked ${count} times` } />

<button onClick() { count++ }>
  Click me
</button>
```

# Heuristics

When `@marko/tags-api-preview` is installed, using any of the following opts into the "tags api" on a per template level:

- tag variable syntax (`<div/el>`).
- any new tag (`<let>`, `<const>`, `<effect>`, etc).
- usage of the attribute binding syntax (`<input value:=myValue/>`).
- a `<!-- use tags -->` comment at the top of the template

There are some features that are disabled when opting into the tags api. Those features will display errors when used.

# Code of Conduct

This project adheres to the [eBay Code of Conduct](./.github/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
