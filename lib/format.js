const sumReducer = (accumulator, currentValue) => accumulator + currentValue;
const secondsToMinutes = (seconds) => Math.round(seconds / 60);

const formatRouteType = (routeType) => routeType.join(' / ');
const calculateFieldSum = (field) => (results) => results
  .map(data => data[field])
  .reduce(sumReducer);
const calculateLength = calculateFieldSum('length');
const calculateDurationWithoutRealTime = calculateFieldSum('crossTimeWithoutRealTime');

module.exports = (alternatives) => alternatives
  .map(alternative => alternative.response)
  .map(({routeName, routeType, totalRouteTime, results}) => ({
    name: routeName,
    type: formatRouteType(routeType),
    length: calculateLength(results),
    duration: totalRouteTime,
    durationWithoutRealTime: calculateDurationWithoutRealTime(results)
  }))
  .map(path => Object.assign(path, {
    date: new Date().toISOString(),
    durationInMinutes: secondsToMinutes(path.duration),
    durationWithoutRealTimeInMinutes: secondsToMinutes(path.durationWithoutRealTime)
  }));
