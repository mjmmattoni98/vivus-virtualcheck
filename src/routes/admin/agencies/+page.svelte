<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Empty from '$lib/components/ui/empty';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import { m } from '$lib/paraglide/messages';
	import type { AgencyExpanded } from '$lib/types';
	import {
		Building2,
		ChevronLeft,
		ChevronRight,
		MoreHorizontal,
		Pencil,
		Plus,
		Search,
		Trash
	} from '@lucide/svelte';

	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let searchInput = $state('');

	// Sync search input with URL param
	$effect(() => {
		searchInput = data.search || '';
	});

	// Dialog States
	let isDialogOpen = $state(false);
	let isEditMode = $state(false);
	let selectedAgency: AgencyExpanded | null = $state(null);
	let isDeleteDialogOpen = $state(false);
	let agencyToDelete: AgencyExpanded | null = $state(null);

	// Search Debounce
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
			year: 'numeric'
		});
	};

	function openCreateDialog() {
		isEditMode = false;
		selectedAgency = null;
		isDialogOpen = true;
	}

	function openEditDialog(agency: AgencyExpanded) {
		isEditMode = true;
		selectedAgency = agency;
		isDialogOpen = true;
	}

	function openDeleteDialog(agency: AgencyExpanded) {
		agencyToDelete = agency;
		isDeleteDialogOpen = true;
	}

	// Close dialogs on success and show toast
	$effect(() => {
		if (form?.success) {
			isDialogOpen = false;
			isDeleteDialogOpen = false;
			if (form.action === 'create') toast.success(m.admin_success_create());
			else if (form.action === 'update') toast.success(m.admin_success_update());
			else if (form.action === 'delete') toast.success(m.admin_success_delete());
			else toast.success(m.admin_success_update());
		} else if (form?.error) {
			toast.error(typeof form.error === 'string' ? form.error : m.admin_error());
		}
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-[--vivus-blue]">{m.admin_agencies()}</h1>
			<p class="text-muted-foreground">{data.totalItems} {m.admin_agencies().toLowerCase()}</p>
		</div>
		<Button onclick={openCreateDialog} class="gap-2">
			<Plus class="size-4" />
			{m.admin_create_agency()}
		</Button>
	</div>

	<!-- Search -->
	<Card.Root>
		<Card.Content class="pt-6">
			<div class="relative">
				<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder={m.admin_search_agencies()}
					class="pl-10"
					bind:value={searchInput}
					oninput={(e) => handleSearch(e.currentTarget.value)}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Table -->
	<Card.Root>
		<Card.Content class="p-0">
			{#if data.records.length === 0}
				<Empty.Root class="py-12">
					<Empty.Icon>
						<Building2 class="size-10" />
					</Empty.Icon>
					<Empty.Title>{m.admin_no_agencies()}</Empty.Title>
				</Empty.Root>
			{:else}
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{m.admin_name()}</Table.Head>
								<Table.Head>{m.admin_phone()}</Table.Head>
								<Table.Head>{m.admin_email()}</Table.Head>
								<Table.Head>{m.admin_website()}</Table.Head>
								<Table.Head>{m.admin_address()}</Table.Head>
								<Table.Head>{m.admin_created()}</Table.Head>
								<Table.Head class="text-right">{m.admin_actions_title()}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.records as agency (agency.id)}
								<Table.Row>
									<Table.Cell class="font-medium">{agency.name}</Table.Cell>
									<Table.Cell>{agency.phone || '-'}</Table.Cell>
									<Table.Cell>
										{#if agency.email}
											<a href="mailto:{agency.email}" class="text-[--vivus-blue] hover:underline">
												{agency.email}
											</a>
										{:else}
											-
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if agency.website}
											<a
												href={agency.website}
												target="_blank"
												rel="noopener noreferrer"
												class="text-[--vivus-blue] hover:underline"
											>
												{agency.website}
											</a>
										{:else}
											-
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if agency.expand?.address}
											{agency.expand.address.line}, {agency.expand.address.city}
										{:else}
											-
										{/if}
									</Table.Cell>
									<Table.Cell class="whitespace-nowrap text-muted-foreground">
										{formatDate(agency.created)}
									</Table.Cell>
									<Table.Cell class="text-right">
										<DropdownMenu.Root>
											<DropdownMenu.Trigger>
												{#snippet child({ props })}
													<Button {...props} variant="ghost" size="icon">
														<MoreHorizontal class="size-4" />
													</Button>
												{/snippet}
											</DropdownMenu.Trigger>
											<DropdownMenu.Content align="end">
												<DropdownMenu.Item onclick={() => openEditDialog(agency)}>
													<Pencil class="mr-2 size-4" />
													{m.admin_edit()}
												</DropdownMenu.Item>
												<DropdownMenu.Item
													class="text-red-600"
													onclick={() => openDeleteDialog(agency)}
												>
													<Trash class="mr-2 size-4" />
													{m.admin_delete()}
												</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
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

<!-- Create/Edit Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isEditMode ? m.admin_edit_agency() : m.admin_create_agency()}</Dialog.Title>
		</Dialog.Header>
		<form action={isEditMode ? '?/update' : '?/create'} method="POST" use:enhance>
			<div class="grid gap-4 py-4">
				{#if isEditMode}
					<input type="hidden" name="id" value={selectedAgency?.id} />
					<input
						type="hidden"
						name="address_id"
						value={selectedAgency?.expand?.address?.id || ''}
					/>
				{/if}
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">{m.admin_name()} *</Label>
					<Input
						id="name"
						name="name"
						value={selectedAgency?.name || ''}
						class="col-span-3"
						required
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="phone" class="text-right">{m.admin_phone()}</Label>
					<Input id="phone" name="phone" value={selectedAgency?.phone || ''} class="col-span-3" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="email" class="text-right">{m.admin_email()}</Label>
					<Input
						id="email"
						name="email"
						type="email"
						value={selectedAgency?.email || ''}
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="website" class="text-right">{m.admin_website()}</Label>
					<Input
						id="website"
						name="website"
						value={selectedAgency?.website || ''}
						class="col-span-3"
					/>
				</div>

				<!-- Address Fields -->
				<div class="col-span-4 mt-2 border-t pt-4">
					<h4 class="mb-4 font-medium">{m.admin_address()}</h4>
					<div class="grid gap-3">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="address_line" class="text-right">Calle</Label>
							<Input
								id="address_line"
								name="address_line"
								value={selectedAgency?.expand?.address?.line || ''}
								class="col-span-3"
							/>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="address_city" class="text-right">{m.admin_city()}</Label>
							<Input
								id="address_city"
								name="address_city"
								value={selectedAgency?.expand?.address?.city || ''}
								class="col-span-3"
							/>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="address_zip" class="text-right">{m.admin_zip()}</Label>
							<Input
								id="address_zip"
								name="address_zip"
								value={selectedAgency?.expand?.address?.zip || ''}
								class="col-span-3"
							/>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="address_country" class="text-right">{m.admin_country()}</Label>
							<Input
								id="address_country"
								name="address_country"
								value={selectedAgency?.expand?.address?.country || ''}
								class="col-span-3"
							/>
						</div>
					</div>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (isDialogOpen = false)}
					>{m.admin_cancel()}</Button
				>
				<Button type="submit">{m.admin_save()}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={isDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.admin_confirm_delete()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.admin_delete_warning()}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (isDeleteDialogOpen = false)}
				>{m.admin_cancel()}</AlertDialog.Cancel
			>
			<form action="?/delete" method="POST" use:enhance>
				<input type="hidden" name="id" value={agencyToDelete?.id} />
				<Button variant="destructive" type="submit">{m.admin_delete()}</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
