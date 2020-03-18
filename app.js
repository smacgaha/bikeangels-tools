const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const Router = require('koa-router');
const updateFromBikeAngels = require('./update-from-bike-angels');

const app = new Koa();
const router = new Router();

const BODYPARSER_CONFIGS = {
  // payloads from bike-angels are huge
  jsonLimit: '20mb',
};
const PORT = process.env.PORT || 3000;

let currentStationInfo = {lastUpdated: 'never', stations: false};

app.use(logger());
app.use(bodyParser(BODYPARSER_CONFIGS));

router.get('/', (ctx) => {
  ctx.body = 'Hello World!';
});

router.get('/current_max_points', async (ctx) => {
  ctx.body = await getMaxPoints(
    ctx.request.query.actualMaxActions, ctx.request.query.numberOfStations);
});

router.post('/add_new_data', async (ctx) => {
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
  ctx.response.body = await getMaxPoints();
});

async function getMaxPoints(actualMaxActions = false, numberOfStations = 1) {
  if (!currentStationInfo.stations) {
    await updateFromBikeAngels();
  }

  const pointedStations = currentStationInfo.stations.map((station) => {
    let maxActions;
    if (actualMaxActions) {
      maxActions = (station.maxPossibleActions < actualMaxActions) ? station.maxPossibleActions : actualMaxActions;
    } else {
      maxActions = station.maxPossibleActions;
    }

    station.maxPoints = maxActions * station.points;
    return station;
  });

  pointedStations.sort((a, b) => {
    return b.maxPoints - a.maxPoints;
  });

  const result = {
    stations: pointedStations.slice(0, numberOfStations),
    actualMaxActions: actualMaxActions,
    lastUpdated: currentStationInfo.lastUpdated,
  };

  return result;
}

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT);
