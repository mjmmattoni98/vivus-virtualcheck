import type { StoreExpanded } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import { ResultAsync } from 'neverthrow';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.pb.authStore.isValid) {
		redirect(303, '/admin/login');
	}
	const pb = locals.pb;
	const page = Number.parseInt(url.searchParams.get('page') || '1');
	const perPage = 20;
	const search = url.searchParams.get('search') || '';

	let filter = '';
	if (search) {
		filter = `name ~ "${search}" || email ~ "${search}" || phone ~ "${search}"`;
	}

	const records = await pb.collection('stores').getList<StoreExpanded>(page, perPage, {
		filter,
		sort: '-created',
		expand: 'address'
	});

	return {
		records: records.items,
		totalPages: records.totalPages,
		currentPage: page,
		totalItems: records.totalItems,
		search
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const phone = formData.get('phone') as string;
		const email = formData.get('email') as string;
		const website = formData.get('website') as string;

		// Address fields
		const addressLine = formData.get('address_line') as string;
		const city = formData.get('address_city') as string;
		const zip = formData.get('address_zip') as string;
		const country = formData.get('address_country') as string;

		if (!name) {
			return fail(400, { missing: true });
		}

		// Handle Address Link
		let addressId = '';
		if (addressLine || city || zip || country) {
			try {
				const addressRecord = await pb.collection('addresses').create({
					line: addressLine,
					city: city,
					zip: zip,
					country: country
				});
				addressId = addressRecord.id;
			} catch (e) {
				console.error('Error creating address:', e);
			}
		}

		const result = await ResultAsync.fromPromise(
			pb.collection('stores').create({
				name,
				phone,
				email,
				website,
				address: addressId || null
			}),
			(e) => e
		);

		if (result.isErr()) {
			console.error(result.error);
			return fail(400, { error: 'Failed to create store' });
		}

		return { success: true, action: 'create' };
	},

	update: async ({ request, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const name = formData.get('name') as string;
		const phone = formData.get('phone') as string;
		const email = formData.get('email') as string;
		const website = formData.get('website') as string;

		// Address fields
		const addressLine = formData.get('address_line') as string;
		const city = formData.get('address_city') as string;
		const zip = formData.get('address_zip') as string;
		const country = formData.get('address_country') as string;

		// Current address ID if exists
		let addressId = formData.get('address_id') as string;

		if (!id || !name) {
			return fail(400, { missing: true });
		}

		// Handle Address Upsert
		if (addressId) {
			// Update existing address
			try {
				await pb.collection('addresses').update(addressId, {
					line: addressLine,
					city: city,
					zip: zip,
					country: country
				});
			} catch (e) {
				console.error('Error updating address:', e);
			}
		} else if (addressLine || city || zip || country) {
			// Create new address if one didn't exist but fields are provided
			try {
				const addressRecord = await pb.collection('addresses').create({
					line: addressLine,
					city: city,
					zip: zip,
					country: country
				});
				addressId = addressRecord.id;
			} catch (e) {
				console.error('Error creating address:', e);
			}
		}

		const result = await ResultAsync.fromPromise(
			pb.collection('stores').update(id, {
				name,
				phone,
				email,
				website,
				address: addressId || null
			}),
			(e) => e
		);

		if (result.isErr()) {
			console.error(result.error);
			return fail(400, { error: 'Failed to update store' });
		}

		return { success: true, action: 'update' };
	},

	delete: async ({ request, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { missing: true });
		}

		const result = await ResultAsync.fromPromise(pb.collection('stores').delete(id), (e) => e);

		if (result.isErr()) {
			console.error(result.error);
			return fail(400, { error: 'Failed to delete store' });
		}

		return { success: true, action: 'delete' };
	}
};
