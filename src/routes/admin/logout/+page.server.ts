import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		locals.pb.authStore.clear();
		cookies.delete('pb_user', { path: '/' });
		redirect(303, '/admin/login');
	}
};
