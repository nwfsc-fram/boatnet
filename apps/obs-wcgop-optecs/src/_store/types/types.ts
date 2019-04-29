import { WcgopTrip} from '@boatnet/bn-models';

// Root state for app store
export interface RootState {
  version: string;
}

export interface AlertState {
  type: string | null;
  message: string | null;
}

export interface BreadcrumbNavigation {
  // TODO - figure out how to store our locations
  currentRouterLocation?: string;
  prevRouterLocation?: any;
}

export interface WcgopAppState {
  currentNavigation?: BreadcrumbNavigation;
  currentTrip?: WcgopTrip;
  isKeyboardEnabled?: boolean;
}
