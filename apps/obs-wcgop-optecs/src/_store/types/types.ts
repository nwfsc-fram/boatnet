import { WcgopTrip} from '@boatnet/bn-models';

// Root state for app store
export interface RootState {
  version: string;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}

export interface WcgopAppState {
  currentSelectionId?: string;
  currentTrip?: WcgopTrip;
  isKeyboardEnabled?: boolean;
  isSoundEnabled?: boolean;
}
