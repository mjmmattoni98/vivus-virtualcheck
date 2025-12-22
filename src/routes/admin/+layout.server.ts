import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Allow access to login page without auth
	if (url.pathname.includes('/login')) {
		return {};
	}

	if (!locals.pb.authStore.isValid) {
		redirect(303, '/admin/login');
	}

	return {};
};
