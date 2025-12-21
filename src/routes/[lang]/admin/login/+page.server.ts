import { fail, redirect } from '@sveltejs/kit';
import { createPocketBase } from '$lib/server/pocketbase';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const authToken = cookies.get('pb_auth');
	if (authToken) {
		redirect(303, '/es/admin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const pb = createPocketBase();
		const formData = await request.formData();

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: true, email });
		}

		try {
			const authData = await pb.collection('users').authWithPassword(email, password);

			// Set auth cookie
			cookies.set('pb_auth', pb.authStore.token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			cookies.set('pb_user', JSON.stringify(authData.record), {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7
			});
		} catch {
			return fail(400, { error: true, email });
		}

		redirect(303, '/es/admin');
	}
};
