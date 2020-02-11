import { BaseTrip, BaseOperation, BaseCatch, Base } from '@boatnet/bn-models';

// Root state for app store
export interface RootState {
    version: string;
}

export interface AlertState {
    type: string | null;
    message: string | null;
}

export interface TripState {
    currentCruise?: Base;
    currentNonFishingDay?: number;
    currentTrip?: BaseTrip;
    currentHaul?: BaseOperation;
    currentCatch?: BaseCatch;
    currentRev?: string;
}

export interface AppSettings {
    isKeyboardEnabled: boolean;
    isSoundEnabled?: boolean;
    appMode: string;
    defaultLocationFormat: string;
    appConfig?: BoatnetConfig;
}

export interface KeyboardState {
    showKeyboard?: boolean;
    keyboardType?: string;
    keyboardInputTarget?: any;
    activeFieldName?: string;
    valueSelected?: boolean;
    next?: any;
}

// TODO represents overall structure of config file
// add on as needed, this is not fixed yet
export interface BoatnetConfig {
    validAppViews?: string[];
    navigationDrawerItems?: [];
    login?: any;
    trips?: any;
    hauls?: any;
    catch?: any;
}
