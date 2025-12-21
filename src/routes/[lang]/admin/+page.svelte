<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty';
	import { Search, Users, ChevronLeft, ChevronRight } from '@lucide/svelte';

	let { data } = $props();

	let searchInput = $state(data.search || '');
	let debounceTimer: ReturnType<typeof setTimeout>;

	const handleSearch = (value: string) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = new URL(page.url);
			if (value) {
				url.searchParams.set('search', value);
			} else {
				url.searchParams.delete('search');
			}
			url.searchParams.set('page', '1');
			goto(url.toString(), { replaceState: true });
		}, 300);
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[--vivus-blue]">{m.admin_contacts()}</h1>
			<p class="text-muted-foreground">{data.totalItems} contactos registrados</p>
		</div>
	</div>

	<!-- Search -->
	<Card.Root>
		<Card.Content class="pt-6">
			<div class="relative">
				<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder={m.admin_search()}
					class="pl-10"
					value={searchInput}
					oninput={(e) => {
						searchInput = e.currentTarget.value;
						handleSearch(searchInput);
					}}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Contacts Table -->
	<Card.Root>
		<Card.Content class="p-0">
			{#if data.contacts.length === 0}
				<Empty.Root class="py-12">
					<Empty.Icon>
						<Users class="size-10" />
					</Empty.Icon>
					<Empty.Title>{m.admin_no_contacts()}</Empty.Title>
				</Empty.Root>
			{:else}
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{m.admin_name()}</Table.Head>
								<Table.Head>{m.admin_phone()}</Table.Head>
								<Table.Head>{m.admin_email()}</Table.Head>
								<Table.Head>{m.admin_agency()}</Table.Head>
								<Table.Head>{m.admin_store()}</Table.Head>
								<Table.Head class="text-center">{m.admin_virtual_check_active()}</Table.Head>
								<Table.Head class="text-center">{m.admin_email_sent()}</Table.Head>
								<Table.Head class="text-center">{m.admin_redeemed()}</Table.Head>
								<Table.Head>{m.admin_created()}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.contacts as contact (contact.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										{contact.name}
										{contact.last_name}
									</Table.Cell>
									<Table.Cell>{contact.phone}</Table.Cell>
									<Table.Cell>
										<a href="mailto:{contact.email}" class="text-[--vivus-blue] hover:underline">
											{contact.email}
										</a>
									</Table.Cell>
									<Table.Cell>
										{#if contact.expand?.agency}
											<Badge variant="outline">{contact.expand.agency.name}</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if contact.expand?.store}
											<Badge variant="secondary">{contact.expand.store.name}</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-center">
										<form method="POST" action="?/updateStatus" use:enhance>
											<input type="hidden" name="contactId" value={contact.id} />
											<input type="hidden" name="field" value="virtual_check_active" />
											<input type="hidden" name="value" value={!contact.virtual_check_active} />
											<button type="submit" class="cursor-pointer">
												<Checkbox checked={contact.virtual_check_active} />
											</button>
										</form>
									</Table.Cell>
									<Table.Cell class="text-center">
										<form method="POST" action="?/updateStatus" use:enhance>
											<input type="hidden" name="contactId" value={contact.id} />
											<input type="hidden" name="field" value="email_sent" />
											<input type="hidden" name="value" value={!contact.email_sent} />
											<button type="submit" class="cursor-pointer">
												<Checkbox checked={contact.email_sent} />
											</button>
										</form>
									</Table.Cell>
									<Table.Cell class="text-center">
										<form method="POST" action="?/updateStatus" use:enhance>
											<input type="hidden" name="contactId" value={contact.id} />
											<input type="hidden" name="field" value="redeemed" />
											<input type="hidden" name="value" value={!contact.redeemed} />
											<button type="submit" class="cursor-pointer">
												<Checkbox checked={contact.redeemed} />
											</button>
										</form>
									</Table.Cell>
									<Table.Cell class="whitespace-nowrap text-muted-foreground">
										{formatDate(contact.created)}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				<!-- Pagination -->
				{#if data.totalPages > 1}
					<div class="flex items-center justify-between border-t px-4 py-3">
						<div class="text-sm text-muted-foreground">
							Página {data.currentPage} de {data.totalPages}
						</div>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={data.currentPage <= 1}
								href="?page={data.currentPage - 1}{data.search ? `&search=${data.search}` : ''}"
							>
								<ChevronLeft class="size-4" />
								Anterior
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={data.currentPage >= data.totalPages}
								href="?page={data.currentPage + 1}{data.search ? `&search=${data.search}` : ''}"
							>
								Siguiente
								<ChevronRight class="size-4" />
							</Button>
						</div>
					</div>
				{/if}
			{/if}
		</Card.Content>
	</Card.Root>
</div>
