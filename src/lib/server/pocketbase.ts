import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const createPocketBase = () => new PocketBase(PUBLIC_POCKETBASE_URL);
