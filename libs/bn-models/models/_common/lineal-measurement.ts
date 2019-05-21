
declare type LinealType = string; // Fork Length, Total Length, etc.

export const LinealMeasurementTypeName = 'lineal-measurement';

export interface LinealMeasurement {
    linealType: LinealType;
}