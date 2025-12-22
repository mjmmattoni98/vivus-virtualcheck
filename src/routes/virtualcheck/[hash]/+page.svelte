<script lang="ts">
	import { enhance } from '$app/forms';
	import vivusLogo from '$lib/assets/vivus_brand_h.svg';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { m } from '$lib/paraglide/messages';
	import { AlertCircle, CheckCircle } from '@lucide/svelte';

	let { data, form } = $props();

	let loading = $state(false);
</script>

<svelte:head>
	<title>{m.form_title()} - Vivus</title>
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
				<Card.Title class="text-2xl font-bold text-[--vivus-blue]">{m.form_title()}</Card.Title>
				<Card.Description>{m.form_subtitle()}</Card.Description>
			</div>
		</Card.Header>

		{#if !data.valid}
			<Card.Content class="text-center">
				<div class="flex flex-col items-center gap-4 py-8">
					<AlertCircle class="size-16 text-[--vivus-burgundy]" />
					<div>
						<h3 class="text-lg font-semibold text-[--vivus-burgundy]">{m.form_invalid_hash()}</h3>
						<p class="text-muted-foreground">{m.form_invalid_hash_message()}</p>
					</div>
				</div>
			</Card.Content>
		{:else if form?.success}
			<Card.Content class="text-center">
				<div class="flex flex-col items-center gap-4 py-8">
					<CheckCircle class="size-16 text-green-500" />
					<div>
						<h3 class="text-lg font-semibold text-green-700">{m.form_success()}</h3>
						<p class="text-muted-foreground">{m.form_success_message()}</p>
					</div>
				</div>
			</Card.Content>
		{:else}
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
					<Field.Root>
						<Field.Label for="name">{m.form_first_name()}</Field.Label>
						<Field.Control>
							<Input
								id="name"
								name="name"
								value={form?.values?.name ?? ''}
								required
								class={form?.errors?.name ? 'border-destructive' : ''}
							/>
						</Field.Control>
						{#if form?.errors?.name}
							<Field.Error>{m.validation_required()}</Field.Error>
						{/if}
					</Field.Root>

					<Field.Root>
						<Field.Label for="last_name">{m.form_last_name()}</Field.Label>
						<Field.Control>
							<Input
								id="last_name"
								name="last_name"
								value={form?.values?.last_name ?? ''}
								required
								class={form?.errors?.last_name ? 'border-destructive' : ''}
							/>
						</Field.Control>
						{#if form?.errors?.last_name}
							<Field.Error>{m.validation_required()}</Field.Error>
						{/if}
					</Field.Root>

					<Field.Root>
						<Field.Label for="phone">{m.form_phone()}</Field.Label>
						<Field.Control>
							<Input
								id="phone"
								name="phone"
								type="tel"
								value={form?.values?.phone ?? ''}
								required
								class={form?.errors?.phone ? 'border-destructive' : ''}
							/>
						</Field.Control>
						{#if form?.errors?.phone}
							<Field.Error>{m.validation_phone()}</Field.Error>
						{/if}
					</Field.Root>

					<Field.Root>
						<Field.Label for="email">{m.form_email()}</Field.Label>
						<Field.Control>
							<Input
								id="email"
								name="email"
								type="email"
								value={form?.values?.email ?? ''}
								required
								class={form?.errors?.email ? 'border-destructive' : ''}
							/>
						</Field.Control>
						{#if form?.errors?.email}
							<Field.Error>{m.validation_email()}</Field.Error>
						{/if}
					</Field.Root>

					{#if form?.error}
						<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{m.form_error()}
						</div>
					{/if}
				</Card.Content>

				<Card.Footer>
					<Button type="submit" class="w-full" disabled={loading}>
						{#if loading}
							<span
								class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
							></span>
						{/if}
						{m.form_submit()}
					</Button>
				</Card.Footer>
			</form>
		{/if}
	</Card.Root>
</div>
