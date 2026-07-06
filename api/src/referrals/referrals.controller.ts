import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ReferralsService } from './referrals.service';
import { ReferralsReadService } from './referrals-read.service';
import { ReportAcceptanceDto } from './dto/report-acceptance.dto';
import { DisputeStatementDto } from './dto/dispute-statement.dto';

/**
 * The invited firm's surface. Everything is scoped to the current user's firm.
 * Mutations run the guarded state-machine transition, then return the fresh
 * detail projection so the client gets the new truth in a single round-trip.
 */
@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class ReferralsController {
  constructor(
    private readonly referrals: ReferralsService,
    private readonly read: ReferralsReadService,
  ) {}

  @Get()
  inbox(@CurrentUser() user: AuthenticatedUser) {
    return this.read.listInboxForFirm(user.firm.id);
  }

  @Get(':id')
  detail(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.read.getDetail(id, user.firm.id);
  }

  @Post(':id/accept')
  @HttpCode(200)
  async accept(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.read.requireFirmOwnsInvitation(id, user.firm.id);
    await this.referrals.accept(id, user.id); // throws 409 on conflict
    return this.read.getDetail(id, user.firm.id);
  }

  @Post(':id/decline')
  @HttpCode(200)
  async decline(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.read.requireFirmOwnsInvitation(id, user.firm.id);
    await this.referrals.decline(id, user.id);
    return this.read.getDetail(id, user.firm.id);
  }

  /** Out-of-band off-platform signing on the firm's own (usually expired) invite. */
  @Post(':id/report-acceptance')
  @HttpCode(200)
  async report(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReportAcceptanceDto,
  ) {
    const inv = await this.read.requireFirmOwnsInvitation(id, user.firm.id);
    const signedAt = dto.signedAt ? new Date(dto.signedAt) : new Date();
    await this.referrals.reportAcceptance(
      inv.referralId,
      user.firm.id,
      user.id,
      signedAt,
    );
    return this.read.getDetail(id, user.firm.id);
  }

  /**
   * A party submits a statement to Lexamica about the open dispute. Option A:
   * private to the adjudicator — the read projection returns only this firm's
   * own statements, never the other side's.
   */
  @Post(':id/dispute-statement')
  @HttpCode(200)
  async disputeStatement(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DisputeStatementDto,
  ) {
    const inv = await this.read.requireFirmOwnsInvitation(id, user.firm.id);
    await this.referrals.addDisputeStatement(
      inv.referralId,
      user.firm.id,
      dto.statement,
      user.id,
    );
    return this.read.getDetail(id, user.firm.id);
  }

  /**
   * Time simulation — force-expire a live invitation so reviewers can drive the
   * sequence without waiting. Not a firm action, so no ownership check; returns
   * only the referral's public status (never disclosure-gated data).
   */
  @Post(':id/force-expire')
  @HttpCode(200)
  async forceExpire(@Param('id') id: string) {
    const ref = await this.referrals.expire(id);
    return { referralId: String(ref?._id), status: ref?.status ?? null };
  }

  /**
   * Demo shortcut for the human-adjudication step: resolve the open dispute on
   * this referral, awarding it to the current firm. In production this is an
   * ops/compliance action, not firm-facing — exposed here so the walkthrough
   * can close the conflict loop.
   */
  @Post(':id/resolve-dispute')
  @HttpCode(200)
  async resolveDispute(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const inv = await this.read.requireFirmOwnsInvitation(id, user.firm.id);
    const disputeId = await this.read.openDisputeIdFor(String(inv.referralId));
    if (!disputeId) {
      throw new ConflictException({
        code: 'NO_OPEN_DISPUTE',
        message: 'There is no open dispute on this referral.',
      });
    }
    await this.referrals.resolveDispute(disputeId, user.firm.id, user.id);
    return this.read.getDetail(id, user.firm.id);
  }
}
