import moment from 'moment';

export const getFormattedValue: any = (value: any, type: string, format: string = 'none') => {
    switch (type) {
        case 'number':
            return value;
        case 'float':
            return value.toFixed(format);
        case 'dateTime':
            return value ? moment(value).format(format) : null;
        case 'lookup':
            return value[format];
        default:
            return value;
    }
};

export const setFormattedValue: any = (value: any, type: string) => {
    switch (type) {
        case 'number':
            return parseInt(value, 10);
        case 'float':
            return parseFloat(value);
        default:
            return value;
    }
}