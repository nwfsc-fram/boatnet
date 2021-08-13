export const commonCols: any[] = [
    {
        name: 'observer',
        label: 'Observer',
        field: 'observer',
    },
    {
        name: 'tripNum',
        label: 'Trip #',
        field: 'tripNum',
    },
    {
        name: 'haulNum',
        label: 'Haul #',
        field: 'haulNum',
    },
    {
        name: 'catchNum',
        label: 'Catch #',
        field: 'catchNum',
    },
    {
        name: 'species',
        label: 'Species',
        field: 'species',
    },
    {
        name: 'dissection',
        label: 'Dissection',
        field: 'dissection',
    },
    {
        name: 'haulUpDate',
        label: 'Haul Up Date',
        field: 'haulUpDate',
        type: 'date',
    },
    {
        name: 'label',
        label: 'Barcode #',
        path: 'label',
        field: 'label',
    },
    {
        name: 'length',
        label: 'Length',
        field: 'length'
    },
    {
        name: 'weight',
        label: 'Weight',
        field: 'weight',
        type: 'number'
    },
    {
        name: 'sex',
        label: 'Sex',
        field: 'sex'
    },
    {
        name: 'received',
        label: 'Received',
        field: 'received'
    }
];

export const snoutCols = [
    {
        name: 'cwtCode',
        label: 'CWT Code',
        field: 'cwtCode',
        path: 'legacy.cwtCode',
        isEditable: true,
        type: 'text',
    },
    {
        name: 'cwtType',
        label: 'CWT Type',
        field: 'cwtType',
        path: 'legacy.cwtType',
        isEditable: true,
        type: 'text',
    },
    {
        name: 'cwtStatus',
        label: 'CWT Status',
        field: 'cwtStatus',
        path: 'legacy.cwtStatus',
        isEditable: true,
        type: 'text',
    },
];

export const otolithCols = [
    {
        name: 'age',
        label: 'Age',
        field: 'age',
        path: 'legacy.age',
        isEditable: true,
        type: 'number',
    },
    {
        name: 'ageReader',
        label: 'Reader',
        field: 'ageReader',
        path: 'legacy.ageReader',
        isEditable: true,
        type: 'text',
    },
    {
        name: 'ageMethod',
        label: 'Method',
        field: 'ageMethod',
        path: 'legacy.ageMethod',
        isEditable: true,
        type: 'select',
        key: 'age-methods'
    },
    {
        name: 'ageDate',
        label: 'Date',
        field: 'ageDate',
        path: 'legacy.ageDate',
        isEditable: true,
        type: 'date',
    },
    {
        name: 'ageLocation',
        label: 'Location',
        field: 'ageLocation',
        path: 'legacy.ageLocation',
        isEditable: true,
        type: 'select',
        key: 'reader-location'
    },
];

export const proccessDissectionsCols = [
    {
        name: 'rackName',
        label: 'Rack Name',
        field: 'rackName',
    },
    {
        name: 'rackLocation',
        label: 'Rack Location',
        field: 'rackLocation',
    },
    {
        name: 'tripNum',
        label: 'Trip #',
        field: 'tripNum',
    },
    {
        name: 'haulNum',
        label: 'Haul #',
        field: 'haulNum',
    },
    {
        name: 'catchNum',
        label: 'Catch #',
        field: 'catchNum',
    },
    {
        name: 'species',
        label: 'Species',
        field: 'species',
    },
    {
        name: 'dissection',
        label: 'Dissection',
        field: 'dissection',
    },
    {
        name: 'label',
        label: 'Barcode #',
        path: 'label',
        field: 'label',
    },
    {
        name: 'received',
        label: 'Received',
        field: 'received',
    }
];

export const reportCols = [
    {
        name: 'vessel',
        label: 'Vessel',
        field: 'vessel',
    },
    {
        name: 'departureDate',
        label: 'Departure Date',
        field: 'departureDate',
        type: 'date',
    },
    {
        name: 'departurePort',
        label: 'Departure Port',
        field: 'departurePort',
    },
    {
        name: 'returnDate',
        label: 'Return Date',
        field: 'returnDate',
        type: 'date',
    },
    {
        name: 'returnPort',
        label: 'Return Port',
        field: 'returnPort',
    },
    {
        name: 'fishery',
        label: 'Fishery',
        field: 'fishery',
    },
    {
        name: 'gearType',
        label: 'Gear Type',
        field: 'gearType',
    },
    {
        name: 'gearPerformance',
        label: 'Gear Perf',
        field: 'gearPerformance',
    },
    
    {
        name: 'haulUpCoord',
        label: 'Haul Up Coord',
        field: 'haulUpCoord',
        type: 'coord',
    },
    {
        name: 'haulSetDate',
        label: 'Haul Set Date',
        field: 'haulSetDate',
        type: 'date',
    },
    {
        name: 'haulSetCoord',
        label: 'Haul Set Coord',
        field: 'haulSetCoord',
        type: 'coord',
    },
    
    
    
    {
        name: 'tag',
        label: 'Tag/Band Id',
        field: 'tag'
    },
];