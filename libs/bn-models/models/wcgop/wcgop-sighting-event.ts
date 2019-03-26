import { BaseEvent } from '../_base';
import { Species, Measurement, BoatnetDate } from '../_common';

// TODO interface definition

export const WcgopSightingEventTypeName = 'wcgop-sighting-event';

export interface WcgopSightingEvent extends BaseEvent {
  species1?: Species;
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
