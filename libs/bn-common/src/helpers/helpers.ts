import moment from 'moment';
import { get } from 'lodash';

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
        case 'isPresent':
            return value.length > 0;
        case 'sum':
            let total = 0;
            for (const val of value) {
                total += get(val, format);
            }
            return total ? total.toFixed(2) : undefined;
        default:
            return value;
    }
};
