import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const authToken = cookies.get('pb_auth');

	// Allow access to login page without auth
	if (url.pathname.includes('/login')) {
		return {};
	}

	if (!authToken) {
		redirect(303, '/es/admin/login');
	}

	return {};
};
