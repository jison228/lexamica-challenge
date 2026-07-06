import type { Types } from 'mongoose';

/** A Mongo id in either form — the domain passes ObjectIds, callers pass strings. */
export type Id = string | Types.ObjectId;
