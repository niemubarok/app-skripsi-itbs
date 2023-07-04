import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import BotService from 'App/services/BotService'
import Helpers from 'App/utils/Helpers';

export default class BotsController {

  public async answer(ctx: HttpContextContract) {

    return await BotService.processMessage(ctx);
  }



  public async train({ }: HttpContextContract) {
    return BotService.trainModel()
  }

  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async test({ request }: HttpContextContract) {

    return Helpers.isNumberOfChoice(5, request.input("message"))
  }
}
