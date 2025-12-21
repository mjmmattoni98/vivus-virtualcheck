import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete('pb_auth', { path: '/' });
		cookies.delete('pb_user', { path: '/' });
		redirect(303, '/es/admin/login');
	}
};
