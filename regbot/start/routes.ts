/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Helpers from 'App/utils/Helpers'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/test', 'BotsController.test')
  Route.post('/hook', 'BotsController.answer')
  Route.get('/train', 'BotsController.train')

}).prefix('/bot')


Route.group(() => {
  Route.post('/pasien', 'PasiensController.index').middleware('getPasien')
  Route.post('dokter', 'DokterController.index')
  //jika pasien baru maka akan ke middleware dulu untuk di input ke table pasien
  Route.post('/pendaftaran', 'BookingController.store').middleware('storePasienBaru')
  // Route.post('/pasien', () => {
  //   return 'pasien'
  // })
  Route.group(() => {
    Route.post('/connect', "WhatsappController.connect")
    Route.post('/sendMessage', "WhatsappController.sendMessage")
    Route.get('/onMessage', "WhatsappController.onMessage")
  }).prefix('/whatsapp')
}).prefix('/api')

Route.post('/tes', async () => {
  const encodedText = "2023/06/19/000002";
  return await Helpers.generateQRCode(encodedText)
})