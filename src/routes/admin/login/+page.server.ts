import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.pb.authStore.isValid) {
		redirect(303, '/admin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		const pb = locals.pb;
		const formData = await request.formData();

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: true, email });
		}

		try {
			await pb.collection('users').authWithPassword(email, password);

			if (pb.authStore.model) {
				cookies.set('pb_user', JSON.stringify(pb.authStore.model), {
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 7
				});
			}
		} catch {
			return fail(400, { error: true, email });
		}

		redirect(303, '/admin');
	}
};
