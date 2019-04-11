import { Base } from '../_base';
import { Vessel } from '../_lookups/vessel';
import { BoatnetDate } from './boatnet-date';
import { Fishery } from '../_lookups/fishery';
import { Person } from '../_lookups/person';
import { Certificate } from './certificate';
import { MultiPolygon } from 'geojson';
import { Port } from '../_lookups/port';

export const ExcursionPlanTypeName = 'excursion-plan';

interface TargetStation {
  id: string;
  geo: MultiPolygon;
}

declare type SelectionReason = string; // Selection

declare type SelectionEventType = string; // Letter Mailed, Letter Returned, etc

interface SelectionEvent {
  date: BoatnetDate;
  type: SelectionEventType;
}

interface ScienceCrewMember {
  person: Person;
  role: string; // TODO lookup
}

interface ExcursionLeg {
  captain?: Person;
  startDate?: BoatnetDate;
  endDate?: BoatnetDate;
  scienceCrew?: ScienceCrewMember[];
}

interface ExcursionPermit {
  permit: Certificate;
  permitHolder?: Person;
}

// For Selection Module
export interface ExcursionPlan extends Base {
  planType?: string; // TODO lookup
  planStatus?: string; // TODO lookup (pending, started, ended, cancelled, etc)
  startDate?: BoatnetDate;
  endDate?: BoatnetDate;
  vessel?: Vessel;
  fishery?: Fishery;
  port?: Port;
  permits?: ExcursionPermit[];
  selectionReason?: SelectionReason;
  selectionEvents?: SelectionEvent[];
  captains?: Person[];
  vesselCrew?: Person[];
  legs?: ExcursionLeg[];
  targetStations?: TargetStation[];
  legacy?: {
    cycleNumber?: number;
    periodNumber?: number;
  };
}
