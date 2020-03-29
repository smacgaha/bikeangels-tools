# bikeangels-tools
Various tools for Citibike Bike Angels

## Getting started

1. `npm install`
1. `npm start`

Should appear at on localhost

## Contributing

1. `npm run lint`

## API

### `/current_max_points`

Query arguments:
* `actualMaxActions`: Actual max number of actions used in calculating the potential points. For example, if a station has 20 bikes and 5 points per bike, it isn't feasible to move 20 bikes. Setting `actualMaxActions` to 5 will instead calculate the `maxPoints` as 25 instead of 100.
* `numberOfStations`: Number of stations to return.

Returns:
* `name`: Name of the station, usually includes cross streets.
* `action`: `give` or `take`. Indicates the action from the station that generates points.
* `maxPoints`: Max number of points that can be obtained from the station.
* `points`: Points per bike from the station.

### `/history`

Returns the number of times each station has gone above a 50 point max with a `maxAction` of 5.
