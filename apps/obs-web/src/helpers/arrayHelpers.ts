export const getArrayValues = (array: any[]) => {
    let returnString = '';
    for (const item of array) {
        returnString += item;
        if (array.indexOf(item) + 1 < array.length && array.length > 1) {
            returnString += ' , ';
        }
    }
    return returnString;
};
