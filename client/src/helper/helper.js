import { format, fromUnixTime } from 'date-fns';

const getCoordinateObj = (coordinate) => {
    const formattedCoordinate = coordinate.replace(/\s+/g, '');
    const splitted = formattedCoordinate.split(',');

    return {
        lat: parseFloat(splitted[0]),
        lng: parseFloat(splitted[1]),
    };
};

const coordinateMatch = (coordinate) => {
    const regexp =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    if (coordinate) return regexp.test(coordinate);
    return false;
};

const formatDate = (date, dateFormat = 'dd MMMM yyyy - HH:mm') => {
    const unixDate = fromUnixTime(date);
    const printableDate = format(unixDate, dateFormat);
    return printableDate;
};

const groupBy = (array, key) => {
    // Return the reduced array
    return array.reduce((result, currentItem) => {
        // If an array already present for key, push it to the array. Otherwise create an array and push the object.
        (result[currentItem[key]] = result[currentItem[key]] || []).push(
            currentItem
        );
        // return the current iteration `result` value, this will be the next iteration's `result` value and accumulate
        return result;
    }, []); // Empty object is the initial value for result object
};

const groupCount = (array, classifier) => {
    classifier = classifier || String;
    return array.reduce(function (counter, item) {
        const p = classifier(item);
        counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
        return counter;
    }, {});
};

const getMax = (data, key) => {
    return data.reduce((item, next) => {
        return !isNaN(parseInt(item[key])) &&
            !isNaN(parseInt(next[key])) &&
            item[key] > next[key]
            ? item
            : next;
    })[key];
};

export {
    getCoordinateObj,
    coordinateMatch,
    formatDate,
    groupBy,
    groupCount,
    getMax,
};
