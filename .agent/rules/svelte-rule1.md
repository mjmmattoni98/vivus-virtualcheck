---
trigger: glob
globs: **/*.svelte,**/*.svelte.ts,*.svelte,*.svelte.ts,*.remote.ts,**/*.remote.ts
---

---
description: When writing code for svelte (.svelte or .svelte.ts files) make sure to do the following.
globs: **/*.svelte,**/*.svelte.ts,*.svelte,*.svelte.ts,*.remote.ts,**/*.remote.ts
alwaysApply: false
---

- always use typescript, the script should be <script lang="ts">
- use svelte 5 (runes, snippets, etc.) syntax
- use remote functions where you can, they are the preferred way to fetch data from the server
- use the new async svelte features when it makes sense to with `<svelte:boundary>` and `await`. it's very similar to how suspense works in react
- if you need to use lucide icons, you can import them from @lucide/svelte (`<script>
  import { Skull } from '@lucide/svelte';
</script>`)

# Svelte 5 Migration Guide

> [!NOTE] **Svelte 5 Migration Changes**
>
> For a comprehensive migration guide, see: https://svelte.dev/docs/svelte/v5-migration-guide/llms.txt
>
> **Key Changes:**
>
> - **Runes API:** Replaced implicit reactivity (`$:`) with explicit runes (`$state`, `$derived`, `$effect`)
> - **Props:** Changed from `export let` to `$props()` rune with destructuring
> - **Events:** Changed from `on:click` to `onclick` (no colon)
> - **Event Modifiers:** Event modifiers are no longer supported. Instead of `<button on:click|once|preventDefault={handler}>`, use `onclick` and handle modifiers in the handler function
> - **Slots to Snippets:** Replaced `<slot>` with `{#snippet}` and `{@render}`
> - **Actions:** Replaced `use:` directive with `@attach`
> - **Component API:** Components are now functions instead of classes
> - **Two-way Binding:** Requires explicit `$bindable` rune for bindable props
> - **Server Rendering:** Components no longer have `render()` method; use `render()` from `svelte/server` for SSR

# svelte 5 docs:

**Core Principles & Setup:**

- **Svelte 5 Mandate:** `MUST` use Svelte 5 API (Runes). Unchanged syntax (`{#if}`) reused from S4 knowledge.
- **Runes Overview:** Built-in keywords (`$`) controlling compiler. `CORRECT: Use as language keywords. AVOID: Importing/calling runes like functions.` Valid in `.svelte`, `.svelte.js`, `.svelte.ts` files.
- **`.svelte` Files:** Optional `<script>`, `<script module>`, `<style>`, markup sections.
  - `<script>`: Runs per component instance. Use runes here.
  - `<script module>`: Runs once per module load. Can export non-default bindings. Variables accessible in instance script, not vice-versa.
  - `<style>`: CSS scoped to the component by default.
- **`.svelte.js`/`.svelte.ts` Files:** Regular JS/TS modules supporting runes for reactive logic/state sharing.
  ```js
  // store.svelte.js
  export let count = $state(0); // Export reactive state
  export const increment = () => count++;
  ```
- **DOM Event Syntax:** `USE onclick={...} (Replaces S4 on:click={...}).` No colon.

**State Management (`$state`)**

- **`$state`:** Creates reactive state. `USE let count = $state(0); (Replaces S4 let count = 0; for reactivity).`

  ```svelte
  <script>
  	let count = $state(0);
  </script>

  <button onclick={() => count++}>Clicked: {count}</button>
  ```

- **Deep State:** Objects/arrays become deeply reactive proxies. Modifications trigger updates.
  ```js
  let obj = $state({ nested: { value: 1 } });
  obj.nested.value = 2; // UI updates
  let arr = $state([]);
  arr.push({ text: 'new' }); // UI updates, new item is reactive
  ```
  `CORRECT: Access properties directly: obj.nested.value. AVOID: Destructuring reactive proxies: let { value } = obj.nested; (breaks reactivity).`
- **Direct Updates:** `CORRECT: Update $state variables directly: count++, arr.push({...}), obj.prop = value. AVOID: Wrapping state in unnecessary custom objects/stores for simple component state.`
- **Classes:** Use `$state` in class fields. Handle `this` context for methods (use arrow functions or `() => instance.method()` in handlers).
  ```js
  class Todo {
  	done = $state(false);
  	text = $state('');
  	reset = () => {
  		/*...*/
  	};
  }
  ```
- **Exporting State:** `CORRECT: Export stateful object: export const counter = $state({ count: 0 }); OR Export getters/actions: export function getCount() { return count; } export function increment() { count++; }. AVOID: Directly exporting reassigned state: export let count = $state(0);.`
- **`$state.raw`:** Shallow, non-tracked state. Updates require reassignment.
  ```js
  let person = $state.raw({ name: 'Zeno' });
  person = { ...person, age: 71 }; // Correct update
  ```
  `CORRECT: Reassign entire object. AVOID: Mutating properties of raw state.`
- **`$state.snapshot`:** Creates a non-reactive, plain object copy. `CORRECT: Use ONLY if external API needs plain object. AVOID: Overusing.`
- **Passing State:** Pass by value semantics. `CORRECT: Pass state to functions via getters: fn(() => stateVal). AVOID: Passing raw state variables assuming live updates inside function.`

**Derived State (`$derived`)**

- **`$derived`:** Computes reactive values from dependencies. `USE const doubled = $derived(count * 2); (Replaces S4 $: double = count * 2;).`

  ```svelte
  <script>
  	let count = $state(0);
  	const doubled = $derived(count * 2);
  </script>

  <p>{count} * 2 = {doubled}</p>
  ```

- **`$derived.by`:** For multi-line/complex logic. `USE $derived.by(() => {...}) when passing a function.`
  ```js
  const total = $derived.by(() => {
  	let sum = 0;
  	/*...*/ return sum;
  });
  ```
- **Reactivity:** Values are not deep proxies. Updates trigger when dependencies change value. Uses push-pull reactivity (recalculated on read).
- **Purity:** `CORRECT: Keep $derived pure (no side effects). AVOID: Assignments/API calls inside $derived.`
- **Dependencies:** Tracks synchronous reads. Use `untrack()` to exclude.
- **Overriding:** Temporarily assign new value (optimistic UI). Reverts on next dependency update. `CORRECT: Assign directly: likes = 1;. AVOID: Overriding via $effect.`
  ```svelte
  <script>
  	let likes = $derived(post.likes);
  	async function like() {
  		likes++; /*...*/
  	}
  </script>
  ```

**Side Effects (`$effect`)**

- **`$effect`:** Runs code reactively _after_ DOM updates when dependencies change. Browser-only. `USE $effect(() => {...}); (Replaces S4 $: console.log(...) for side effects).`
  ```svelte
  <script>
  	let size = $state(50);
  	$effect(() => {
  		console.log('Size:', size);
  	});
  </script>
  ```
- **Usage:** `CORRECT: Use $effect for: logging, non-declarative DOM manipulation, external subscriptions (WebSocket, timers), analytics. AVOID: Using $effect for state sync/derivation (use $derived).`
- **Lifecycle & Cleanup:** Can return a cleanup function (runs before re-run or on unmount). `CORRECT: Return cleanup for intervals, listeners, etc. AVOID: Forgetting cleanup.`
  ```js
  $effect(() => { const id = setInterval(...); return () => clearInterval(id); });
  ```
- **Dependencies:** Tracks synchronous reads only. Async values (post-`await`, `setTimeout`) not tracked.
- **`$effect.pre`:** Runs _before_ DOM updates. `CORRECT: Use for pre-DOM tasks (reading scroll position). AVOID: Standard post-update effects.`
- **`$effect.tracking`:** Debugging helper: returns `true` if inside reactive context.
- **`$effect.root`:** Creates non-tracked scope needing manual cleanup via returned function. Niche use case.

**Component Inputs (`$props`)**

- **`$props`:** Access component inputs. `USE let { foo = true, bar } = $props(); (Replaces S4 export let foo = true; export let bar;).`

  ```svelte
  <!-- MyComponent.svelte -->
  <script>
  	let { adjective = 'great' }: { adjective?: string } = $props();
  </script>

  <p>Component is {adjective}</p>
  ```

- **Immutability:** `CORRECT: Treat props read-only. Use callbacks or $bindable for changes. AVOID: Directly modifying props: adjective = 'new';.` Reassigning props locally is allowed but usually discouraged; mutation has complex rules/warnings (see source doc if needed).
- **Features:** Fallbacks (`prop = 'default'`), renaming (`{ class: className }`), rest (`{ a, ...rest }`).
- **`$props.id()`:** Generates unique component instance ID string. `CORRECT: Use for unique IDs (labels, aria). AVOID: Manual ID generation.`
- **Typing:** Use interfaces or inline types: `let { name }: { name: string } = $props();`. For generics: `<script lang="ts" generics="T"> ... let { item }: { item: T } = $props(); </script>`.

**Two-Way Binding (`$bindable`)**

- **`$bindable`:** Explicitly marks prop for two-way binding (`bind:prop`). `USE let { value = $bindable('fallback') } = $props(); (Unlike S4 implicit bindable props).`

  ```svelte
  <!-- FancyInput.svelte -->
  <script>
  	let { value = $bindable('') } = $props();
  </script>

  <input bind:value />
  ```

  ```svelte
  <!-- App.svelte -->
  <script>
  	let name = $state('world');
  </script>

  <FancyInput bind:value={name} />
  ```

  `CORRECT: Use when two-way binding is needed. AVOID: Overusing; prefer one-way flow + callbacks.`

**Snippets (Reusable Markup Chunks)**

- **Concept:** Define reusable, parameterized **HTML markup** sections within the component **template area**. `USE {#snippet ...}` (Replaces S4 `<slot>`).
- **Definition:** `{#snippet name(params)}...{/snippet}`. Parameters are optional, support defaults (`p='default'`), and destructuring. No rest params (`...args`).

  ```svelte
  <script>
  	let message = 'Hello'; // Accessible by snippet below
  </script>

  <!-- Snippet defined in template markup -->
  {#snippet greet(name = 'world')}
  	<p>{message} {name}!</p>
  {/snippet}
  ```

- **Rendering:** Use `{@render snippetName(args)}` **in the template** to display a snippet. `USE {@render ...}` (Replaces S4 `<slot ...>`).
  - `CORRECT: Always invoke with parentheses: {@render greet()}, {@render greet('Svelte')}. AVOID: Omitting (): {@render greet}.`
  - Render optional snippets: `{@render maybeSnippet?.()}`.
  ```svelte
  <!-- Rendering in template -->
  {@render greet('Developer')}
  ```
- **Scope:** Snippets access variables from their outer `<script>` or template scope. Render within scope or pass down.
- **Passing Snippets (in template):**
  - **As Props:** Pass like values: `<ChildComponent {greet} />`.
  - **Implicit Props:** Define inside component tag: `<Child>{#snippet greet ...}{/snippet}</Child>`. Becomes `greet` prop on `Child`.
  - **`children` Snippet:** Direct content `<Child>Text</Child>` becomes `children` prop. Render via `{@render children()}` in `Child`.

**Template Syntax**

- **Basic Markup:** Lowercase tags = HTML, Capitalized = Components. Attributes: Standard HTML, JS expressions `{value}`, boolean shorthand `{disabled}`, spread `{...attrs}`. Props: Similar syntax, shorthand `{prop}`, spread `{...props}`.
- **Text Expressions:** `{expression}`. Escaped by default. `{@html rawHtmlString}` for unescaped HTML (use with caution!).
- **Comments:** `<!-- HTML comment -->`. `<!-- svelte-ignore directive -->`. `<!-- @component Doc comment -->`.
- **Logic Blocks:**
  - `{#if condition}...{:else if condition}...{:else}...{/if}`
  - `{#each items as item, index (item.id)}...{:else}...{/each}` (Key `(item.id)` is crucial for performance/animation). Supports destructuring.
  - `{#await promise}...{:then value}...{:catch error}...{/await}` (Blocks optional).
  - `{#key expression}...{/key}` (Destroys/recreates content when expression changes).
- **`{@const ...}`:** Define local constant: `{@const area = width * height}`. Allowed inside blocks/components.
- **`{@debug ...}`:** Debug helper: `{@debug var1, var2}` logs changes, pauses debugger. Dev-only.