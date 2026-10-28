import { currentDb } from './world.ts';
export const getSupabase = () => currentDb().client;
