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

app.use(logger());
app.use(bodyParser(BODYPARSER_CONFIGS));

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World!';
});

router.post('/add_new_data', (ctx, next) => {
  const valid_stations = ctx.request.body.features.filter((feature) => {
    return feature.properties.bike_angels_points;
  });

  const stationInfoToStore = valid_stations.map((feature) => {
    return {
      station_id: feature.properties.station_id,
      name: feature.properties.name,
      action: feature.properties.bike_angels_action,
      points: feature.properties.bike_angels_points,
    };
  });

  max_point_station = {points: 0}
  stationInfoToStore.forEach((station) => {
    if (station.points > max_point_station.points) {
      max_point_station = station;
    }
  });

  console.log(max_point_station)

  ctx.body = 'Hello World!';
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
