import { PublicFirm, toPublicFirm } from '../firms/firm.types';
import { FirmDocument } from '../firms/schemas/firm.schema';
import { UserDocument } from './schemas/user.schema';

/**
 * The public projection of a user — the ONLY shape that may leave the server.
 * Note the deliberate absence of `passwordHash`. Confidentiality at the
 * rendering layer starts here: if a field isn't on this type, it never reaches
 * a client payload. The user's firm is embedded as its own public projection.
 */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  firm: PublicFirm;
}

/** Requires `firm` to be populated (see UsersService). */
export function toPublicUser(user: UserDocument): PublicUser {
  const firm = user.firm as unknown as FirmDocument;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    firm: toPublicFirm(firm),
  };
}
