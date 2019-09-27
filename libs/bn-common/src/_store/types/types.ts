import { BaseTrip, BaseOperation, BaseCatch } from '@boatnet/bn-models';

// Root state for app store
export interface RootState {
    version: string;
}

export interface AlertState {
    type: string | null;
    message: string | null;
}

export interface TripState {
    currentTrip?: BaseTrip;
    currentHaul?: BaseOperation;
    currentCatch?: BaseCatch;
}

export interface AppSettings {
    isKeyboardEnabled: boolean;
    isSoundEnabled?: boolean;
}

export interface KeyboardState {
    showKeyboard?: boolean;
    keyboardType?: string;
    keyboardInputTarget?: any;
}
