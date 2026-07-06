import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { Firm, FirmDocument } from './firms/schemas/firm.schema';
import { User, UserDocument } from './users/schemas/user.schema';
import { Referral, ReferralDocument } from './referrals/schemas/referral.schema';
import {
  Invitation,
  InvitationDocument,
} from './invitations/invitation.schema';
import { Dispute, DisputeDocument } from './disputes/dispute.schema';
import {
  ReferralAuditEvent,
  ReferralAuditEventDocument,
} from './referrals/schemas/referral-audit-event.schema';
import { ReferralsService } from './referrals/referrals.service';

/* eslint-disable no-console */

// Hollis originates the cases; the three candidate firms (Avery, Brennan,
// Carter) can be invited. Alice/Bob/Carol are the login users for those firms.
const FIRMS = [
  { slug: 'hollis-law', name: 'Hollis Law' },
  { slug: 'avery-associates', name: 'Avery & Associates' },
  { slug: 'brennan-injury-law', name: 'Brennan Injury Law' },
  { slug: 'carter-legal', name: 'Carter Legal Group' },
];

const USERS = [
  { email: 'alice@lexamica.com', name: 'Alice Avery', firmSlug: 'avery-associates' },
  { email: 'bob@lexamica.com', name: 'Bob Brennan', firmSlug: 'brennan-injury-law' },
  { email: 'carol@lexamica.com', name: 'Carol Carter', firmSlug: 'carter-legal' },
];
const PASSWORD = 'password';

// Every referral cycles A → B → C (Avery → Brennan → Carter) for easy testing.
const CANDIDATE_SLUGS = ['avery-associates', 'brennan-injury-law', 'carter-legal'];

type CaseDef = {
  publicSummary: Record<string, string>;
  protectedDetails: Record<string, string>;
};

// The first is the mid-sequence conflict case; the rest are placed and pending
// at firm A (Avery) so the lists are populated.
const CASES: CaseDef[] = [
  {
    publicSummary: {
      caseType: 'Motor Vehicle Accident',
      state: 'California',
      estimatedValueRange: '$250k–$500k',
      description:
        'Rear-end collision at a signalized intersection; liability contested, damages well-documented. Originating firm seeks co-counsel with trial capacity.',
    },
    protectedDetails: {
      clientName: 'Maria Gonzalez',
      clientContact: '(555) 213-9987',
      narrative: 'Rear-ended at a red light on US-101; ongoing physical therapy and lost wages.',
    },
  },
  {
    publicSummary: {
      caseType: 'Slip and Fall',
      state: 'Texas',
      estimatedValueRange: '$75k–$150k',
      description:
        'Fall on an unmarked wet floor at a grocery retailer; surveillance footage preserved.',
    },
    protectedDetails: {
      clientName: 'James Whitfield',
      clientContact: '(555) 664-2201',
      narrative: 'Fractured wrist and hip contusion; two months out of work.',
    },
  },
  {
    publicSummary: {
      caseType: 'Medical Malpractice',
      state: 'New York',
      estimatedValueRange: '$500k–$1.2M',
      description:
        'Delayed diagnosis leading to complications; strong expert support, complex discovery.',
    },
    protectedDetails: {
      clientName: 'Priya Raman',
      clientContact: '(555) 908-7746',
      narrative: 'Misread imaging delayed treatment by four months; significant harm.',
    },
  },
  {
    publicSummary: {
      caseType: 'Product Liability',
      state: 'Florida',
      estimatedValueRange: '$180k–$350k',
      description:
        'Defective consumer appliance caused a house fire; manufacturer already on notice.',
    },
    protectedDetails: {
      clientName: 'Derek Olsen',
      clientContact: '(555) 330-1188',
      narrative: 'Space heater ignited overnight; burns and property loss.',
    },
  },
  {
    publicSummary: {
      caseType: 'Premises Liability',
      state: 'Illinois',
      estimatedValueRange: '$90k–$220k',
      description:
        'Inadequate security at an apartment complex; assault on a tenant, prior incidents documented.',
    },
    protectedDetails: {
      clientName: 'Angela Ruiz',
      clientContact: '(555) 771-0043',
      narrative: 'Attacked in an unlit parking garage; landlord ignored complaints.',
    },
  },
  {
    publicSummary: {
      caseType: 'Dog Bite',
      state: 'Arizona',
      estimatedValueRange: '$40k–$85k',
      description: 'Unleashed dog attack in a public park; owner identified, homeowner policy in play.',
    },
    protectedDetails: {
      clientName: 'Tom Becker',
      clientContact: '(555) 214-6690',
      narrative: 'Bitten on the forearm; nerve damage and scarring.',
    },
  },
  {
    publicSummary: {
      caseType: 'Wrongful Death',
      state: 'California',
      estimatedValueRange: '$1M+',
      description:
        'Commercial truck collision on the interstate; wrongful death, multiple potential defendants.',
    },
    protectedDetails: {
      clientName: 'Estate of Robert Hale',
      clientContact: '(555) 502-3319',
      narrative: 'Fatal highway collision with a fatigued commercial driver.',
    },
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const firmModel = app.get<Model<FirmDocument>>(getModelToken(Firm.name));
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const referralModel = app.get<Model<ReferralDocument>>(getModelToken(Referral.name));
  const invitationModel = app.get<Model<InvitationDocument>>(getModelToken(Invitation.name));
  const disputeModel = app.get<Model<DisputeDocument>>(getModelToken(Dispute.name));
  const auditModel = app.get<Model<ReferralAuditEventDocument>>(
    getModelToken(ReferralAuditEvent.name),
  );
  const referrals = app.get(ReferralsService);

  // Firms + users (idempotent upsert).
  const firmId = new Map<string, Types.ObjectId>();
  for (const f of FIRMS) {
    const doc = await firmModel.findOneAndUpdate(
      { slug: f.slug },
      { $set: f },
      { upsert: true, returnDocument: 'after' },
    );
    firmId.set(f.slug, doc!._id);
  }
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  for (const u of USERS) {
    await userModel.updateOne(
      { email: u.email },
      {
        $set: {
          email: u.email,
          name: u.name,
          role: 'attorney',
          passwordHash,
          firm: firmId.get(u.firmSlug),
        },
      },
      { upsert: true },
    );
  }
  console.log(`seeded ${FIRMS.length} firms, ${USERS.length} users (password: ${PASSWORD})`);

  // Fresh referral domain each run — reproducible demo state.
  await Promise.all([
    referralModel.deleteMany({}),
    invitationModel.deleteMany({}),
    disputeModel.deleteMany({}),
    auditModel.deleteMany({}),
  ]);

  const candidateFirmIds = CANDIDATE_SLUGS.map((s) => firmId.get(s)!);
  const create = async (c: CaseDef): Promise<ReferralDocument> => {
    const ref = new referralModel({
      originatedFirmId: firmId.get('hollis-law'),
      candidateFirmIds,
      publicSummary: c.publicSummary,
      protectedDetails: c.protectedDetails,
    });
    await ref.save();
    return ref;
  };

  // 1) The mid-sequence conflict case: Avery expired → Brennan is the live one.
  const main = await create(CASES[0]);
  await referrals.place(main._id);
  const firstInv = await invitationModel.findOne({ referralId: main._id, position: 0 });
  await referrals.expire(firstInv!._id);

  // 2) The rest: placed and currently pending at firm A (Avery).
  for (const c of CASES.slice(1)) {
    const ref = await create(c);
    await referrals.place(ref._id); // invites Avery (position 0, ACTIVE)
  }

  console.log(
    `seeded ${CASES.length} referrals: 1 mid-sequence conflict (Brennan live) + ` +
      `${CASES.length - 1} pending at Avery`,
  );

  await app.close();
  console.log('Seed complete.');
  process.exit(0);
}

void seed();
