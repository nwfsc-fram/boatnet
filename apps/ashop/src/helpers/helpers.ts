import moment from 'moment';

export const getFormattedValue: any = (value: any, type: string, format: string = 'none') => {
    switch (type) {
        case 'number':
            return value;
        case 'float':
            return value.toFixed(format);
        case 'dateTime':
            return moment(value).format(format);
        case 'lookup':
            return value[format];
        default:
            return value;
    }
};
