<script lang="ts">
	import vivusLogo from '$lib/assets/vivus_brand_h.svg';
	import { m } from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button';
	import { LogOut, Users, Building2, Store as StoreIcon } from '@lucide/svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>{m.admin_dashboard()} - Vivus</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- Header -->
	<header class="border-b border-border bg-white shadow-xs">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
			<div class="flex items-center gap-4">
				<img src={vivusLogo} alt="Vivus" class="h-8" />
				<nav class="ml-8 flex items-center gap-2">
					<Button variant="ghost" href="/admin" class="gap-2">
						<Users class="size-4" />
						{m.admin_contacts()}
					</Button>
					<Button variant="ghost" href="/admin/agencies" class="gap-2">
						<Building2 class="size-4" />
						{m.admin_agencies()}
					</Button>
					<Button variant="ghost" href="/admin/stores" class="gap-2">
						<StoreIcon class="size-4" />
						{m.admin_stores()}
					</Button>
				</nav>
			</div>
			<form method="POST" action="/admin/logout">
				<Button variant="outline" type="submit" class="gap-2">
					<LogOut class="size-4" />
					{m.admin_logout()}
				</Button>
			</form>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 bg-muted/30">
		<div class="mx-auto max-w-7xl px-4 py-8">
			{@render children()}
		</div>
	</main>
</div>
