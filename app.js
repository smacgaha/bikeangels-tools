const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

const BODYPARSER_CONFIGS = {
  // payloads from bike-angels are huge
  jsonLimit: '20mb',
};
const PORT = process.env.PORT || 3000

let currentStationInfo = {lastUpdated: 'never', stations: false}

app.use(logger());
app.use(bodyParser(BODYPARSER_CONFIGS));

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World!';
});

router.get('/current_max_points', (ctx, next) => {
  ctx.body = getMaxPoints(ctx.request.query.actualMaxActions);
});

router.post('/add_new_data', (ctx, next) => {
  const validStations = ctx.request.body.features.filter((feature) => {
    return feature.properties.bike_angels_points;
  });

  currentStationInfo.stations = validStations.map((feature) => {
    const action = feature.properties.bike_angels_action;
    const availableBikes = feature.properties.bikes_available;
    const availableDocks = feature.properties.docks_available;

    let maxPossibleActions;
    if (action == 'give') {
      maxPossibleActions = availableDocks - availableBikes;
    } else {
      maxPossibleActions = availableBikes;
    }

    return {
      stationId: feature.properties.station_id,
      name: feature.properties.name,
      action: action,
      maxPossibleActions: maxPossibleActions,
      points: feature.properties.bike_angels_points,
    };
  });
  currentStationInfo.lastUpdated = new Date().toISOString();
  ctx.response.body = getMaxPoints()
});

function getMaxPoints(actualMaxActions = false) {
  maxPointStation = {maxPoints: 0}

  console.log(currentStationInfo)
  currentStationInfo.stations.forEach((station) => {
    let maxActions;
    if (actualMaxActions) {
      maxActions = (station.maxPossibleActions < actualMaxActions) ? station.maxPossibleActions : actualMaxActions;
    } else {
      maxActions = station.maxPossibleActions;
    }

    stationPoints = maxActions * station.points;

    if (stationPoints > maxPointStation.maxPoints) {
      maxPointStation = station;
      maxPointStation.maxPoints = stationPoints;
    }
  });
  maxPointStation.lastUpdated = currentStationInfo.lastUpdated
  return maxPointStation;
}

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT);
