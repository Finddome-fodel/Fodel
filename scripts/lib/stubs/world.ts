/** The test's shared state: which fake database is live, what was e-mailed, which invoices were drafted. */
export const world: { db: any; sent: { to: string; subject: string }[]; drafts: string[]; stripeCalls: any[]; sessions: Record<string, any> } = {
  db: null, sent: [], drafts: [], stripeCalls: [], sessions: {},
};
export const currentDb = () => world.db;
