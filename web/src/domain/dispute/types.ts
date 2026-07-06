/** Input for reporting an off-platform signing (which may open a dispute). */
export interface ReportSigningInput {
  signedAt?: string;
  statement?: string;
}

/** What reporting a signing will do right now. */
export const ReportKind = {
  CLAIM: 'claim',
  DISPUTE: 'dispute',
} as const;
export type ReportKind = (typeof ReportKind)[keyof typeof ReportKind];
