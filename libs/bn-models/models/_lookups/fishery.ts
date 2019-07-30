// TODO Full implementation
export const FisheryTypeName = 'fishery';
export type Sector = string; // WCGOP Obs Analyst Sectors
export type GovernmentOrganization = string; // TODO LOOKUPS
// NOAA Fisheries, ODFW, WDFW, CDFW, IPHC

// from lookups table
export interface Fishery {
  name: string;
  organization?: GovernmentOrganization;
  isIfq?: boolean; // CatchShares, Shoreside Hake, Motherside Catcher-Vessel
  // Trawl Gear Modification EFP (anything program 14 previously)
  isEfp?: boolean;
  isEm?: boolean; // ETL - anything program ID = 17 in OBSPROD.LOOKUPS.FISHERIES
  isOpenAccess?: boolean;
  // true = CA Halibut, WC OA Fixed Gear,
  // false = Pacific Halibut, because managed by IPHC
  isLimitedEntry?: boolean; // false = Pacific Halibut
  isPermitted?: boolean; // is a permit given for this fishery?
  // WC Open Access Fixed Gear (any vessel can do this)
  // IPHC Directed Commerical Halibut do not have permits (using vessel number for IPHC)
  //      we get a yearly list from IPHC
  //
  isActive?: boolean;
  sector?: Sector; // WCGOP Analyst Sectors
  // For fishery that breaks out into multiple sectors, ends up being based on
  //  gear + proportional landings (so 50% or more Hake, etc.)

  // We would need to do a check against the fish tickets for this breakout for the lbs landed

  // EM, Trawl Gear Modification - do checks to see if they're using bottom trawl pelagically
  //                                  helps them determine if they are fishing midwater

  legacy?: {
    lookupValue?: number;
    programId?: number;
  };
}

/*
Fisheries
ETL from OBSPROD.LOOKUPS.LOOKUP_TYPE = FISHERIES and ACTIVE IS NULL



Permits exists for a given, single Fishery
Permit is associated with a:
- vessel or
- person (CA nearshore) (pocket permit)
  -- person can walk onto any vessel at any time
- endorsement (WA pink shrimp) (effectively a vessel permit)

Open Access - West Coast Groundfish Open Access Fixed Gear (WCOA)
- No open access trawling in federal waters
- Need a more expanded FG GEAR TYPE than what's in OBSPROD.LOOKUPS.FG_GEAR_TYPE

- any number of species that can be targeted, with nothing
   more than a commercial fishing license
- The state has not increased regulation and federal
   regulation is that anyone can do it, but there is a amount limit
- Species include (4 of primary interest of WCGOP):
  -- Sablefish
  -- Lingcod
  -- Thornyhead (mostly short)
  -- Rockfish
  -- Sanddab

  Others
  -- Minor Slope Rockfish / Dark-blotched Rockfish
  -- Pacific Ocean Perch
  -- Short Spine Thornyhead
  -- Longspine Thornyhead
  -- Dover sole, etc.
  -- Pacific hake
  -- Minor Shelf Rockfish
  -- Yellowtail Rockfish
  -- etc.


Vessels

*/
