---
trigger: glob
globs: **/*.svelte,**/*.svelte.ts,*.svelte,*.svelte.ts,*.remote.ts,**/*.remote.ts
---

---

description: When writing code for svelte (.svelte or .svelte.ts files) make sure to do the following.
globs: **/\*.svelte,**/_.svelte.ts,_.svelte,_.svelte.ts,_.remote.ts,\*_/_.remote.ts
alwaysApply: false

---

**Debugging Reactivity (`$inspect`) (Development Only)**

- **Purpose:** Observe state changes and trace dependencies during development. **`$inspect` is removed in production builds (no-op).**
- **Log State Changes:** `$inspect(var1, var2, ...)` logs values when they change and pauses the debugger if devtools are open.

  ```svelte
  <script>
  	let count = $state(0);
  	$inspect(count);
  </script>

  <button onclick={() => count++}>Inc: {count}</button>
  ```

- **Custom Inspection (`.with(callback)`):** Execute custom logic on change. `callback(type, value)` where `type` is 'init' or 'update'.
  ```js
  // Trigger debugger when count updates and exceeds 5
  $inspect(count).with((type, val) => {
  	if (type === 'update' && val > 5) debugger;
  });
  ```
- **Trace Dependencies (`.trace()`):** Inside `$effect` or `$derived`, use `$inspect.trace('optional label')` to log which specific dependencies triggered the re-run.
  ```js
  $effect(() => {
  	$inspect.trace(); // Logs which dependency change triggered this effect
  	console.log('Effect ran:', someState);
  });
  ```

**Data Binding (`bind:`)**

- **Concept:** Two-way data binding. `bind:prop={value}` or shorthand `bind:value`.
- **Common Inputs:** `bind:value` (text, number, range, select), `bind:checked` (checkbox), `bind:group` (radio/checkbox group), `bind:files` (file input). Use `defaultValue`/`defaultChecked` for form reset behavior.
- **Media Elements:** `bind:currentTime`, `bind:paused`, `bind:duration` (audio/video), `bind:videoWidth/Height` (video), `bind:naturalWidth/Height` (img).
- **Other Elements:** `bind:open` (details), `bind:innerHTML`/`textContent` (contenteditable), `bind:offsetWidth`/`Height`, `clientWidth`/`Height`, `scrollWidth`/`Height`, `scrollLeft`/`Top` (readonly dimensions/scroll).
- **`bind:this`:** Get reference to DOM element or component instance.
- **Component Binding:** Requires child prop marked with `$bindable`. `<Child bind:value={parentState} />`.
- **Function Bindings:** Advanced control: `bind:value={() => getter, (v) => setter(v)}`. Readonly binding: `bind:clientWidth={null, redrawFn}`.
- See: https://svelte.dev/docs/svelte/bind/llms.txt

**Actions (`@attach`)**

> [!NOTE] **Actions in Svelte 5**
>
> The `use:` directive has been replaced with `@attach` in Svelte 5. For information on how to use `@attach`, see: https://svelte.dev/docs/svelte/@attach/llms.txt

**Transitions & Animations**

- **`transition:fn={params}`:** Animate element in/out of DOM (bidirectional). From `svelte/transition`. Use `|global` modifier for non-local transitions.
- **`in:fn={params}` / `out:fn={params}`:** Unidirectional transitions.
- **`animate:fn={params}`:** Animate reordering within keyed `{#each}` blocks. From `svelte/animate`.
- **Custom Functions:** Return object with `delay`, `duration`, `easing`, and `css` (preferred) or `tick`.
- See: https://svelte.dev/docs/svelte/svelte-transition/llms.txt

**Styling**

- **`<style>` Block Usage:** Define component styles within a `<style>` tag. **The content inside `<style>` MUST be standard CSS syntax; it's processed at compile time, not generated dynamically with JS `{expressions}`.**

  ```svelte
  <script>
  	// Svelte variable holding a color value
  	let mainColor = $state('blue');
  </script>

  <!-- Set the CSS variable using the Svelte variable -->
  <p style:--p-color={mainColor}>Styled text</p>

  <style>
  	/* Standard CSS using the variable */
  	p {
  		color: var(--p-color, black); /* Use CSS variable with fallback */
  		font-weight: bold;
  	}
  </style>
  ```

- **Scoped Styles:** By default, CSS in `<style>` is **scoped** to the component (Svelte adds unique classes). Specificity is boosted. `@keyframes` also scoped.
- **Global Styles:** `CORRECT: Use :global(.selector) or :global { ... } block. AVOID: Overusing.` Use `-global-` prefix for global `@keyframes`.
- **Inline Styles (`style:`):** Set styles directly: `style:opacity={value}`, shorthand `style:color`, important `style:color|important="blue"`. Also used to set CSS custom properties (`style:--my-var={jsValue}`).
- **CSS Classes (`class` / `class:`):**
  - **`class` Attribute (Recommended):** `class="string"`, `class={expr}`, object `class={{ active: isActive }}`, array `class={[isActive && 'active']}`.
  - `class:` Directive (Legacy): `class:name={bool}` or `class:name`. Prefer `class` attribute.
- **CSS Custom Properties (`--*`):** Pass to components: `<Comp --bg-color="blue" />`. Access in CSS: `var(--bg-color, fallbackValue)`. Set dynamically using `style:--my-var={jsValue}`.

**Special Elements `<svelte:...>`**

- **`<svelte:head>`:** Insert content into `document.head`.
- **`<svelte:element this={tag} {...attrs}>`:** Render dynamic HTML element type. `bind:this` only.
- **`<svelte:window bind:scrollY={y} on:event={handler}/>`:** Interact with `window`.
- **`<svelte:document on:event={handler} use:action />`:** Interact with `document`.
- **`<svelte:body on:event={handler} use:action />`:** Interact with `document.body`.
- **`<svelte:boundary onerror={handler}>{#snippet failed(e,r)}</svelte:boundary>`:** Catch rendering errors. Provide `failed` snippet for fallback UI. `onerror` prop for programmatic handling. Catches render/effect errors, not async/event handler errors. See: https://svelte.dev/docs/svelte/svelte-boundary/llms.txt

**Runtime API**

- **Stores (`svelte/store`):** For complex async/external state. `writable`, `readable`, `derived`, `readonly`, `get`. Access value via `$store` prefix in components. Prefer runes (`.svelte.js` state) for simpler cases.
- **Context API (`svelte`):** Pass values down component tree without props. `setContext(key, value)`, `getContext(key)`, `hasContext(key)`. Useful for theme, user data.
- **Lifecycle (`svelte`):** `onMount(() => cleanup?)` (browser-only, runs after mount), `onDestroy(() => ...)` (runs before unmount), `tick()` (promise resolving after updates). `$effect.pre`/`$effect` replace `before/afterUpdate`.
- **Imperative API (`svelte`):** Less common for generation. `mount(Comp, { target, props })`, `unmount(instance)`, `hydrate(Comp, { target, props })`. SSR: `render(Comp, { props })` from `svelte/server`.

**Stores with Classes and Context**

- **Class-based Stores:** Create reactive stores using classes with `$state` and `$derived` runes. `CORRECT: Use classes for complex state management with methods and derived values. AVOID: Overusing for simple component state.`

  ```ts
  class AuthStore {
  	private userId = $state<string | null>(null);

  	isLoading = $derived(this.userId === null);
  	isAuthenticated = $derived(this.userId !== null);

  	setUser = (id: string) => {
  		this.userId = id;
  	};
  }
  ```

- **Context Pattern:** Use `createContext` with `setContext`/`getContext` to share store instances across component tree.

  ```ts
  import { createContext } from 'svelte';

  const [getStore, setStore] = createContext<AuthStore>();

  // In parent component
  setStore(new AuthStore());

  // In child components
  const store = getStore();
  ```

- **Setup Pattern:** `CORRECT: Create context tuple, initialize store in parent component with setContext, access in children with getContext. AVOID: Storing context keys in separate constants (unnecessary abstraction).`

  ```ts
  const [internalGetStore, internalSetStore] = createContext<AuthStore>();

  export const getStore = () => {
  	const store = internalGetStore();
  	if (!store) throw new Error('Store not found');
  	return store;
  };

  export const setStore = () => internalSetStore(new AuthStore());
  ```

- **Usage:** Parent components call `setStore()` to initialize; child components call `getStore()` to access the shared instance. All `$state` and `$derived` properties remain reactive.

---

# sveltekit docs:

**Core Concepts**

- **Framework:** Builds full-stack apps with Svelte components. Handles routing, data loading, build optimization, SSR/CSR/SSG.
- **Project Structure:** Key items: `src/routes` (app pages/endpoints), `src/lib` (shared code, `$lib` alias), `src/app.html` (HTML shell), `static` (public assets), `svelte.config.js`, `vite.config.js`.

**Routing (Filesystem-based in `src/routes`)**

- **Pages:** `+page.svelte`. `USE +page.svelte (Replaces S4 route.svelte).`
- **Layouts:** `+layout.svelte`. Wrap pages/child layouts. Use `{@render children()}`. Nesting inherits.
- **Data Loading:** `+page.js`/`+layout.js` (universal load), `+page.server.js`/`+layout.server.js` (server-only load & actions).
- **API Endpoints:** `+server.js`. Export functions named `GET`, `POST`, etc.
- **Remote Functions:** `.remote.ts`. For example, for a set of remote functions for "todos" the file name would be `todos.remote.ts`.
- **Error Pages:** `+error.svelte`. Catches errors in its subtree.
- **Dynamic Routes:** `[param]`, rest `[...param]`, optional `[[param]]`. Matchers `[param=matcher]` (defined in `src/params/matcher.js`).

**Page Options (Export `const` from `+page/layout .js/.server.js`)**

- **`prerender = true`:** Static Site Generation (SSG). Needs `adapter-static`. Dynamic routes need `entries()`.
- **`ssr = false`:** Client-Side Rendering only (SPA mode).
- **`csr = false`:** No JS hydration (static HTML).
- **`trailingSlash = 'always' | 'never' | 'ignore'`:** URL format.

**Other Core Features**

- **Hooks (`hooks.server.js`, `hooks.client.js`):** `handle` (middleware, modify `event.locals`), `handleError` (catch unexpected errors), `handleFetch` (intercept server fetch).
- **Server-only Modules:** Use `$lib/server/`, `*.server.js`, `$env/.../private`. Build fails if imported into client code.
- **State Management:** `CORRECT: Pass server data via load/props. Use context/stores/URL for client state. AVOID: Shared mutable server variables.`
- **Error Handling:** `error(status, data)` helper throws expected error -> `+error.svelte`. Unexpected errors -> `handleError`.
- **Link Options (`<a>` attributes):** `data-sveltekit-preload-data/code`, `data-sveltekit-reload`, etc. Tune navigation/preloading.
- **Service Workers (`src/service-worker.js`):** Offline support via `$service-worker` module.
- **Snapshots (`snapshot` export):** Preserve ephemeral component state across navigation.
- **Shallow Routing (`$app/navigation`):** `pushState`/`replaceState` to change URL/state without navigation. Access via `page.state`.

**Best Practices**

- **SEO:** Use `<svelte:head>` for metadata (`title`, `description`). Create `sitemap.xml` endpoint. Keep SSR enabled for public pages.

**Key Modules Reference**

- **`@sveltejs/kit`:** `error`, `fail`, `redirect`, `json`, `text`.
- **`$app/forms`:** `enhance`, `applyAction`, `deserialize`.
- **`$app/navigation`:** `goto`, `invalidate`, `invalidateAll`, `preloadData`, `preloadCode`, `beforeNavigate`, `afterNavigate`, `pushState`, `replaceState`.
- **`$app/paths`:** `base`, `assets`.
- **`$app/server` (Server-only):** `read`, `getRequestEvent`.
- **`$app/state`:** `page`, `navigating`, `updated`.
- **`$env/...`:** Access environment variables.
- **`$lib`:** Alias for `src/lib`.
