const request = require('superagent')

const HOST = process.env['URL'] || 'localhost:3000';

async function updateFromBikeAngels() {
  const bikeAngelRes = await request.get('https://bikeangels-api.citibikenyc.com/map/v1/nyc/stations')

  const appRes = await request.post(`${HOST}/add_new_data`)
    .send(bikeAngelRes.body);

  console.log(appRes.body)
}

if (require.main == module) {
  (
    updateFromBikeAngels()
      .then(() => process.exit(0))
      .catch((error) => {
        console.log(error)
        process.exit(1)
      })
  )
}

module.exports = updateFromBikeAngels;
