import { BaseEvent } from "../_base";

export const HakeSurveyNetEventTypeName = 'hake-survey-net-event';

export interface HakeSurveyNetEvent extends BaseEvent {

    // Events include
    // Haul Back, Target Depth, Net in Water,
    //   Shooting Doors, Doors Up, On Deck 

    // TODO ETL - spelunk for older event times

}