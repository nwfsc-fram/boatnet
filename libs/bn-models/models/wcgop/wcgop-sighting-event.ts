import { Species, Measurement, BoatnetDate, CouchID, LocationEvent } from '../_common';

export const WcgopSightingEventTypeName = 'wcgop-sighting-event';

export interface WcgopSightingEvent extends LocationEvent {
  // Populate _id for use in references
  species?: Species;
  minNumber?: number;
  maxNumber?: number;
  bestNumber?: number;
  approachDistance?: Measurement;
  confidence?: string; // Lookup value
  bodyLength?: string; // Lookup value, value/UM stored in single string
  sightingCondition?: string;
  beaufortValue?: string; // Lookup value
  waterTemperature?: Measurement;
  interactionOutcome?: string; // Lookup value
  interactionBehaviors?: string[]; // Ugly lookup value, reevaluate

  legacy?: {
    speciesSightingId?: number;
    tripId?: number;
    operationId?: number;
    obsprodLoadDate?: BoatnetDate;
  };
}
