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

let currentMax = {lastUpdated: 'never', highestPointStation: 'unknown'}

app.use(logger());
app.use(bodyParser(BODYPARSER_CONFIGS));

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World!';
});

router.get('/current_max_points', (ctx, next) => {
  ctx.body = currentMax;
});

router.post('/add_new_data', (ctx, next) => {
  const validStations = ctx.request.body.features.filter((feature) => {
    return feature.properties.bike_angels_points;
  });

  const stationInfoToStore = validStations.map((feature) => {
    const action = feature.properties.bike_angels_action;
    const points = feature.properties.bike_angels_points;
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
      points: points,
      maxPoints: maxPossibleActions * points,
    };
  });

  maxPointStation = {maxPoints: 0}
  stationInfoToStore.forEach((station) => {
    if (station.maxPoints > maxPointStation.maxPoints) {
      maxPointStation = station;
    }
  });

  currentMax = {
    lastUpdated: new Date().toISOString(),
    highestPointStation: maxPointStation,
  }

  ctx.response.body = maxPointStation;
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);
