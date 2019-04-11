import { Base } from "../_base";
import { Vessel } from "../_lookups/vessel";
import { BoatnetDate } from "./boatnet-date";
import { Fishery } from "../_lookups/fishery";
import { Person } from "../_lookups/person";
import { Certificate } from "./certificate";
import { Polygon, MultiPolygon } from "geojson";
import { Port } from "../_lookups/port";

export const ExcursionPlanTypeName = 'excursion-plan';

declare type TargetStation = {
    id: string;
    geo: MultiPolygon;
};

declare type SelectionReason = string; // Selection

declare type SelectionEventType = string; // Letter Mailed, Letter Returned, etc
declare type SelectionEvent = {
    date: BoatnetDate;
    type: SelectionEventType;
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
    permits?: {
        permit: Certificate;
        permitHolder?: Person;
    }[];
    selectionReason?: SelectionReason;
    selectionEvents?: SelectionEvent[];
    captains?: Person[];
    vesselCrew?: Person[];
    legs?: {
        captain?: Person;
        startDate?: BoatnetDate;
        endDate?: BoatnetDate;
        scienceCrew?: {
            person: Person;
            role: string;  // TODO lookup
        }[];
    }[];
    targetStations?: TargetStation[];
    legacy?: {
        cycleNumber?: number;
        periodNumber?: number;
    }
}
