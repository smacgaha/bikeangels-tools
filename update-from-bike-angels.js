const request = require('superagent')

async function updateFromBikeAngels() {
  const bikeAngelRes = await request.get('https://bikeangels-api.citibikenyc.com/map/v1/nyc/stations')

  const appRes = await request.post(`${process.env['URL']}/add_new_data`)
    .send(bikeAngelRes.body);

  console.log(appRes.body)
}

(
  updateFromBikeAngels()
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error)
      process.exit(1)
    })
)
