import { error, fail } from '@sveltejs/kit';
import { createPocketBase } from '$lib/server/pocketbase';
import type { AgencyStoreExpanded } from '$lib/types';
import { z } from 'zod';
import { err, ok } from 'neverthrow';
import type { Actions, PageServerLoad } from './$types';

const contactSchema = z.object({
	name: z.string().min(1),
	last_name: z.string().min(1),
	phone: z.string().min(1),
	email: z.email()
});

export const load: PageServerLoad = async ({ params }) => {
	const pb = createPocketBase();
	const { hash } = params;

	const getAgencyStore = async () => {
		try {
			const records = await pb.collection('agency_stores').getList<AgencyStoreExpanded>(1, 1, {
				filter: `relation_hash = "${hash}"`,
				expand: 'agency,store'
			});

			if (records.items.length === 0) {
				return err('NOT_FOUND' as const);
			}

			return ok(records.items[0]);
		} catch {
			return err('ERROR' as const);
		}
	};

	const result = await getAgencyStore();

	if (result.isErr()) {
		if (result.error === 'NOT_FOUND') {
			return { valid: false };
		}
		error(500, 'Error loading data');
	}

	const agencyStore = result.value;

	return {
		valid: true,
		hash,
		agencyId: agencyStore.agency,
		storeId: agencyStore.store,
		agencyName: agencyStore.expand?.agency?.name,
		storeName: agencyStore.expand?.store?.name
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const pb = createPocketBase();
		const { hash } = params;

		const formData = await request.formData();
		const data = {
			name: formData.get('name') as string,
			last_name: formData.get('last_name') as string,
			phone: formData.get('phone') as string,
			email: formData.get('email') as string
		};

		const validation = contactSchema.safeParse(data);
		if (!validation.success) {
			return fail(400, { errors: validation.error.flatten().fieldErrors, values: data });
		}

		// Get agency_store to retrieve agency and store IDs
		const getAgencyStore = async () => {
			try {
				const records = await pb.collection('agency_stores').getList<AgencyStoreExpanded>(1, 1, {
					filter: `relation_hash = "${hash}"`
				});

				if (records.items.length === 0) {
					return err('NOT_FOUND' as const);
				}

				return ok(records.items[0]);
			} catch {
				return err('ERROR' as const);
			}
		};

		const agencyStoreResult = await getAgencyStore();

		if (agencyStoreResult.isErr()) {
			return fail(400, { error: 'INVALID_HASH', values: data });
		}

		const agencyStore = agencyStoreResult.value;

		// Create contact
		const createContact = async () => {
			try {
				await pb.collection('contacts').create({
					...validation.data,
					agency: agencyStore.agency,
					store: agencyStore.store,
					acceptance: false,
					virtual_check_active: true,
					email_sent: false,
					redeemed: false
				});
				return ok(true);
			} catch {
				return err('CREATE_ERROR' as const);
			}
		};

		const createResult = await createContact();

		if (createResult.isErr()) {
			return fail(500, { error: 'CREATE_ERROR', values: data });
		}

		return { success: true };
	}
};
