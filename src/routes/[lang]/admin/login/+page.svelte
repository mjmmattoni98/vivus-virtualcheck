<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages';
	import vivusLogo from '$lib/assets/vivus_brand_h.svg';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { AlertCircle } from '@lucide/svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>{m.admin_login()} - Vivus</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-linear-to-br from-[--vivus-blue]/5 via-white to-[--vivus-orange]/5 p-4"
>
	<Card.Root class="w-full max-w-md shadow-xl">
		<Card.Header class="space-y-4 text-center">
			<div class="flex justify-center">
				<img src={vivusLogo} alt="Vivus" class="h-12" />
			</div>
			<div>
				<Card.Title class="text-2xl font-bold text-[--vivus-blue]">{m.admin_login()}</Card.Title>
				<Card.Description>{m.admin_dashboard()}</Card.Description>
			</div>
		</Card.Header>

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			<Card.Content class="space-y-4">
				{#if form?.error}
					<div
						class="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
					>
						<AlertCircle class="size-4" />
						{m.admin_login_error()}
					</div>
				{/if}

				<Field.Root>
					<Field.Label for="email">{m.admin_email()}</Field.Label>
					<Field.Control>
						<Input id="email" name="email" type="email" value={form?.email ?? ''} required />
					</Field.Control>
				</Field.Root>

				<Field.Root>
					<Field.Label for="password">{m.admin_password()}</Field.Label>
					<Field.Control>
						<Input id="password" name="password" type="password" required />
					</Field.Control>
				</Field.Root>
			</Card.Content>

			<Card.Footer>
				<Button type="submit" class="w-full" disabled={loading}>
					{#if loading}
						<span
							class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></span>
					{/if}
					{m.admin_login_button()}
				</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
