import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DisputeRepository } from '../disputes/dispute.repository';
import { InvitationRepository } from '../invitations/invitation.repository';
import { InvitationDocument } from '../invitations/invitation.schema';
import { ReferralStatus } from './referral.enums';
import type {
  InvitationDetail,
  InvitationListItem,
} from './referral.projections';
import { ReferralRepository } from './repositories/referral.repository';
import { AuditRepository } from './repositories/audit.repository';
import { ReferralDocument } from './schemas/referral.schema';

/**
 * Read-side of the referral domain: builds the invited-firm projections and,
 * crucially, ENFORCES DISCLOSURE — `protectedDetails` is only ever attached
 * when the requesting firm is the accepted firm, and dispute statements are
 * filtered to the firm's own. A non-accepted firm's payload never contains the
 * fields at all. Reads go through the repositories; no model access here.
 */
@Injectable()
export class ReferralsReadService {
  constructor(
    private readonly referrals: ReferralRepository,
    private readonly invitations: InvitationRepository,
    private readonly disputes: DisputeRepository,
    private readonly audit: AuditRepository,
  ) {}

  /** The firm's inbox — every invitation ever sent to it, newest first. */
  async listInboxForFirm(firmId: string): Promise<InvitationListItem[]> {
    const invitations = await this.invitations.findByFirmLean(firmId);
    if (invitations.length === 0) return [];

    const referralIds = [...new Set(invitations.map((i) => String(i.referralId)))];
    const referrals = await this.referrals.findByIdsLean(referralIds);
    const refById = new Map(referrals.map((r) => [String(r._id), r]));

    const reported = new Set(
      await this.audit.referralIdsReportedBy(referralIds, firmId),
    );
    return invitations.map((inv) =>
      this.toListItem(
        inv,
        refById.get(String(inv.referralId)),
        firmId,
        reported.has(String(inv.referralId)),
      ),
    );
  }

  /** Detail for one of the firm's own invitations, with disclosure applied. */
  async getDetail(invitationId: string, firmId: string): Promise<InvitationDetail> {
    const inv = await this.requireFirmOwnsInvitation(invitationId, firmId);
    const ref = await this.referrals.findByIdLean(inv.referralId);
    if (!ref) throw new NotFoundException('Referral not found.');

    const amAccepted = String(ref.currentAcceptedFirmId ?? '') === String(firmId);

    const dispute =
      ref.status === ReferralStatus.IN_CONFLICT
        ? await this.disputes.findOpenByReferralLean(ref._id)
        : null;

    // a firm sees ONLY its own statements to the
    // adjudicator — never the other side's.
    const disputeStatements = (dispute?.claims ?? [])
      .filter((c) => String(c.firmId) === String(firmId))
      .map((c) => ({ content: c.content ?? '', occurredAt: c.occurredAt }))
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

    const alreadyReported = await this.audit.hasReported(ref._id, firmId);

    return {
      ...this.toListItem(inv, ref, firmId, alreadyReported),
      // ── DISCLOSURE GATE ──────────────────────────────────────────────
      protectedDetails: amAccepted ? ref.protectedDetails : null,
      // ─────────────────────────────────────────────────────────────────
      disputeStatus: dispute?.status ?? null,
      disputeReason: dispute?.reason ?? null,
      disputeStatements,
    };
  }

  /** The open (unresolved) dispute id for a referral, if any. */
  async openDisputeIdFor(referralId: string): Promise<string | null> {
    const d = await this.disputes.findOpenByReferralLean(referralId);
    return d ? String(d._id) : null;
  }

  /** Authz: a firm may only ever read/act on its own invitations. */
  async requireFirmOwnsInvitation(
    invitationId: string,
    firmId: string,
  ): Promise<InvitationDocument> {
    const inv = await this.invitations.findByIdLean(invitationId);
    if (!inv) throw new NotFoundException('Invitation not found.');
    if (String(inv.firmId) !== String(firmId)) {
      throw new ForbiddenException('This invitation belongs to another firm.');
    }
    return inv as unknown as InvitationDocument;
  }

  private toListItem(
    inv: InvitationDocument,
    ref: ReferralDocument | undefined,
    firmId: string,
    alreadyReported: boolean,
  ): InvitationListItem {
    const amAccepted = String(ref?.currentAcceptedFirmId ?? '') === String(firmId);
    // PRIVACY: a firm that doesn't hold the case never learns that another firm
    // took it — a MATCHED referral reads as UNMATCHED to everyone but the holder.
    // (Still reportable: the firm can claim it, which the server turns into a
    // duplicate-representation dispute if the case is in fact held.)
    const referralStatus =
      !amAccepted && ref?.status === ReferralStatus.MATCHED
        ? ReferralStatus.UNMATCHED
        : (ref?.status ?? ReferralStatus.MATCHING);
    return {
      invitationId: String(inv._id),
      referralId: String(inv.referralId),
      status: inv.status,
      position: inv.position,
      sentAt: inv.sentAt,
      expiresAt: inv.expiresAt,
      respondedAt: inv.respondedAt ?? null,
      referralStatus,
      publicSummary: ref!.publicSummary,
      amAccepted,
      alreadyReported,
    };
  }
}
