import { WcgopTrip, WcgopOperation, WcgopCatch } from '@boatnet/bn-models';

// Root state for app store
export interface RootState {
  version: string;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}

export interface PdfState {
  tripId?: string;
  haulId?: string;
  catchId?: string;
}

export interface KeyboardState {
  showKeyboard?: boolean;
  keyboardType?: string;
  keyboardInputTarget?: any;
}

export interface WcgopAppState {
  currentTrip?: WcgopTrip;
  currentHaul?: WcgopOperation;
  currentCatch?: WcgopCatch;
  isKeyboardEnabled: boolean;
  isSoundEnabled?: boolean;
}
