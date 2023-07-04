import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
// import Pasien from 'App/Models/Pasien'

export default class GetPasien {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    //AMBIL DATA PASIEN DARI FRONTEND
    const { data: req } = request.body()
    let dataToReturn = {}

    try {

      const [[pasienFromDB]] = await Database.rawQuery("select * from pasien where no_ktp = ? and nm_pasien like ?", [req.noKtp, `%${req.namaPasien}%`])

      dataToReturn = pasienFromDB || {}

      //JIKA PASIEN TIDAK DITEMUKAN DI DATABASE
      if (Object.keys(dataToReturn).length === 0) {
        //BERARTI PASIEN ADALAH PASIEN BARU
        //RETURN null
        response.json({
          data: null,
          message: 'pasien tidak ditemukan',
        })
      } else {
        //jika pasien ditemukan di database
        //update request body
        request.updateBody({
          pasien: dataToReturn,
          original_request: request.body(),
        })

        await next()
      }
    } catch (error) {
      console.log(error)
    }
  }
}
