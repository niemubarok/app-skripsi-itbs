import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
// import GreetingService from './EntityService'
// import PasienService from './PasienService'
import Helpers from "../utils/Helpers";
import DokterService from "./DokterService";
import PoliService from "./PoliService";
import MenuService from "./MenuService";
import IntentService from "./IntentService";
import StateService from "./StateService";
import StepService from "./StepService";
import Database from "@ioc:Adonis/Lucid/Database";
import BookingService from "./BookingService";
import PasienService from "./PasienService";
import ReplyService from "./ReplyService";

export default class BotService {
  public static async processMessage(ctx: HttpContextContract) {

    const message = ctx.request.input("message");
    const phoneNumber = ctx.request.input("phoneNumber");

    if (message == "tes") {
      const qrcode = await Helpers.generateQRCode("2023/06/19/000002")
      return await ReplyService.replyMedia("tes qr", qrcode, 'media')
    }
    // return ctx.request.body()

    console.log("message", message);

    const state: any = await Helpers.getCache("state", phoneNumber);
    const step: any = await Helpers.getCache("step", phoneNumber);




    let userMessage = message;

    if (step !== 'tunggu formulir') {

      userMessage = Helpers.spellCheck(message);
    }
    console.log("state di bot service", state);
    console.log("step di bot service", step);

    if ((userMessage as string).includes('📋') || (userMessage as string).includes('�')) {
      const extractedData: any = await Helpers.extractDataDariPesan(message as string);
      const dokter = await DokterService.getDokterByName(extractedData.dokterTujuan)
      Helpers.setCache("data dokter", JSON.stringify(dokter), phoneNumber)
      const poli = await PoliService.getPoliByNama(extractedData.poliTujuan);
      Helpers.setCache("dataPoli", JSON.stringify(poli), phoneNumber)
      Helpers.setCache("tanggal periksa", extractedData.tanggalBerobat, phoneNumber);


      const pasienFromDB = await PasienService.getPatient({ ktp: extractedData.noKtp })

      if (pasienFromDB.length > 0) {
        Helpers.setCache("dataPasien", JSON.stringify(pasienFromDB[0]), phoneNumber)

        return await BookingService.handleBooking(phoneNumber)
      } else {
        const pasienBaru = await PasienService.storePasienBaru(phoneNumber, extractedData)
        Helpers.setCache("dataPasien", JSON.stringify(pasienBaru), phoneNumber)

        return BookingService.handleBooking(phoneNumber)

      }
    }

    if (userMessage == '0') {
      Helpers.delCache("step", phoneNumber)
      Helpers.delCache("state", phoneNumber)
      return MenuService.listMenu(phoneNumber)
    }



    if (step) {
      return StepService.handleStep(phoneNumber, userMessage);
    }

    if (state) {
      return await StateService.handleState(userMessage, phoneNumber)
    }
    return await IntentService.onIntent(userMessage, phoneNumber)




  }

  public static async trainModel() {
    const [dokter] = await Database.rawQuery(
      "SELECT nm_dokter FROM dokter"
    )

    const [poli] = await Database.rawQuery(
      "SELECT nm_poli FROM poliklinik"
    )

    return dokter


  }
}
