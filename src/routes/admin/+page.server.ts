import { redirect } from '@sveltejs/kit';
import type { ContactExpanded } from '$lib/types';
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
		filter = `name ~ "${search}" || last_name ~ "${search}" || email ~ "${search}" || phone ~ "${search}"`;
	}

	const contacts = await pb.collection('contacts').getList<ContactExpanded>(page, perPage, {
		filter,
		sort: '-created',
		expand: 'agency,store'
	});

	return {
		contacts: contacts.items,
		totalPages: contacts.totalPages,
		currentPage: page,
		totalItems: contacts.totalItems,
		search
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();

		const contactId = formData.get('contactId') as string;
		const field = formData.get('field') as string;
		const value = formData.get('value') === 'true';

		const updateData: Record<string, unknown> = { [field]: value };

		// If redeemed is being set to true, also set redeemed_at
		if (field === 'redeemed' && value) {
			updateData.redeemed_at = new Date().toISOString();
		}

		await pb.collection('contacts').update(contactId, updateData);

		return { success: true };
	}
};
