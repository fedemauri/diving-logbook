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
    return false
};

export {getCoordinateObj, coordinateMatch}