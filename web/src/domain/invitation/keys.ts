/** React Query keys for the invitation domain — one place, no stringly-typed drift. */
export const invitationKeys = {
  inbox: ['inbox'] as const,
  detail: (invitationId: string) => ['invitation', invitationId] as const,
};
