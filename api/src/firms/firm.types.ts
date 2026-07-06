import { FirmDocument } from './schemas/firm.schema';

export interface PublicFirm {
  id: string;
  name: string;
  slug: string;
}

export function toPublicFirm(firm: FirmDocument): PublicFirm {
  return { id: firm.id, name: firm.name, slug: firm.slug };
}
