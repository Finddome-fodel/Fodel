import { currentDb } from './world.ts';
export const createSupabaseAdminClient = () => currentDb().client;
export const createSupabaseServerClient = () => currentDb().client;
