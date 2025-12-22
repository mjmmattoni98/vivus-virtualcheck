import { paraglideMiddleware } from '$lib/paraglide/server';
import { createPocketBase } from '$lib/server/pocketbase';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

const pocketbaseHandle: Handle = async ({ event, resolve }) => {
	event.locals.pb = createPocketBase();

	// load the store data from the request cookie string
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
		}
	} catch {
		// clear the auth store on failed refresh
		event.locals.pb.authStore.clear();
	}

	event.locals.user = event.locals.pb.authStore.model;

	const response = await resolve(event);

	// send back the default 'pb_auth' cookie to the client with the latest store state
	response.headers.append(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7
		})
	);

	return response;
};

const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		});
	});

export const handle: Handle = sequence(pocketbaseHandle, paraglideHandle);
