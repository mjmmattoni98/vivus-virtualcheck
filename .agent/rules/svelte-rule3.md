---
trigger: glob
globs: **/*.svelte,**/*.svelte.ts,*.svelte,*.svelte.ts,*.remote.ts,**/*.remote.ts
---

---

description: When writing code for svelte (.svelte or .svelte.ts files) make sure to do the following.
globs: **/\*.svelte,**/_.svelte.ts,_.svelte,_.svelte.ts,_.remote.ts,\*_/_.remote.ts
alwaysApply: false

---

**Using images with SvelteJS**

Use the following example when managing images:

```js
  <script>
    import MyImage from './path/to/your/image.jpg?enhanced';
  </script>

  <enhanced:img src={MyImage} alt="some alt text" />
```

**Import Requirements**

Understanding what needs an `import` statement is crucial.

**1. DO NOT Import (Globally Available or Implicit):**

- **Runes:** All runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`, `$inspect`, `$host`) are compiler keywords. **Never** import them.
- **Template Blocks/Directives:** All template syntax (`{#if}`, `{#each}`, `{#await}`, `{#snippet}`, `{@render}`, `{@html}`, `{@debug}`, `{@const}`, `bind:`, `use:`, `transition:`, `in:`, `out:`, `animate:`, `style:`, `class:`) are part of the Svelte template language. **No import needed.**
- **Special Elements:** All `<svelte:...>` elements (`<svelte:head>`, `<svelte:window>`, `<svelte:document>`, `<svelte:body>`, `<svelte:element>`, `<svelte:options>`, `<svelte:boundary>`) are part of the Svelte language. **No import needed.**

**2. Imports Required When Needed:**

- **From `svelte`:**
  - Lifecycle functions: `onMount`, `onDestroy`, `tick`.
  - Context API: `setContext`, `getContext`, `hasContext`, `getAllContexts`.
  - Imperative API: `mount`, `unmount`, `hydrate`.
- **From `svelte/transition`, `svelte/animate` and `svelte/easing`:**
  - Built-in transitions, animations and easing functions
- **From `@sveltejs/kit`:**
  - API/Action helpers: `error`, `fail`, `redirect`, `json`, `text`.
- **From `$app/...` Modules (SvelteKit):**
  - `$app/forms`: `enhance`, `applyAction`, `deserialize`.
  - `$app/navigation`: `goto`, `invalidate`, `invalidateAll`, `beforeNavigate`, `afterNavigate`, `preloadData`, `preloadCode`, `pushState`, `replaceState`, etc.
  - `$app/paths`: `base`, `assets`.
  - `$app/server` (Server-only): `read`, `getRequestEvent`.
  - `$app/state`: `page`, `navigating`, `updated`.
  - `$app/environment`: `dev`, `browser`, `building`.
- **From `$env/...` Modules (SvelteKit):**
  - Environment variables (`$env/static/public`, `$env/static/private`, etc.).

# remote functions docs:

> [!NOTE] **Remote Functions Documentation**
>
> For the latest information on how to use remote functions (`query`, `form`, `command`, `prerender`), see: https://svelte.dev/docs/kit/remote-functions/llms.txt
>
> For information on how using `await` works in Svelte components, see: https://svelte.dev/docs/svelte/await-expressions/llms.txt

# async svelte docs:

> [!NOTE] **Async/Await Expressions**
>
> For complete documentation on using `await` in Svelte components, see: https://svelte.dev/docs/svelte/await-expressions/llms.txt
>
> **Quick setup:** Enable `experimental.async: true` in `svelte.config.js` to use `await` at the top level of `<script>`, inside `$derived`, and in markup.
