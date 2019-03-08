// Boatnet Base interface, all data stored should inherit this.

export interface BoatnetBase {
    type: string;
    created_by: string;
    created_date: string;
    updated_by?: string;
    updated_date?: string;
}