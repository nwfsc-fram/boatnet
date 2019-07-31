import { Base } from '../_base';
import { BoatnetDate } from '../_common';
import { MultiLineString } from 'geojson';
import { CatchGrouping } from './catch-grouping';
import { TaxonomyAlias } from './taxonomy-alias';

declare type ManagementType = string; // TODO - lookup - IFQ, FMP, etc.
declare type GeographyType = {
    name: string;
    geography: MultiLineString;
};

export const ManagementAreaTypeName = 'management-area';

export interface ManagementArea extends Base {
    name: string;
    year: BoatnetDate;
    area: GeographyType;  // 2 lines only per management area
    managementType: ManagementType;
    members: CatchGrouping | TaxonomyAlias;
}

/*
    Arrowtooth
        area: 100
        year: 2019
    Arrowtooth
        area: 200
        year: 2019
    ...

    Minor Shelf Rockfish North
        area: 100
        members:  CatchGrouping = Minor Shelf Rockfish North

    Minor Shelf Rockfish South
        area: 200
        members:  CatchGrouping = Minor Shelf Rockfish South

    Minor Shelf Rockfish South
        area: 300
        members:  CatchGrouping = Minor Shelf Rockfish South

    Minor Shelf Rockfish South
        area: 400
        members:  CatchGrouping = Minor Shelf Rockfish South

*/
