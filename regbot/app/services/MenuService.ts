import Helpers from "App/utils/Helpers";
import PoliService from "./PoliService";
import IntentService from "./IntentService";
import ReplyService from "./ReplyService";

export default class MenuService {
  public static async listMenu(phoneNumber: number) {
    Helpers.delCache('state', phoneNumber)
    Helpers.delCache('step', phoneNumber)
    Helpers.setCache('state', 'menu', phoneNumber)
    return await ReplyService.reply(`Silahkan pilih menu berikut:
        \n1. Cek Jadwal Poli
        \n2. Daftar Berobat
        \n3.Bantuan Customer Service`)
  }

  public static async handleMenu(input: any, phoneNumber: number) {
    const list: any = /^[1-3]$/;
    // return list.test(input.trim())
    if (list.test(input.trim())) {
      switch (input.trim()) {
        case "1":
          const [poliFromJadwal] = await PoliService.getNamaPoliFromJadwal();
          const poliTersedia = poliFromJadwal.map(
            (poli: any, index: number) => {
              return `${index + 1}. ${poli.nm_poli}`;
            }
          );
          Helpers.setCache("step", "jadwal poli", phoneNumber);
          Helpers.setCache("data poli", poliFromJadwal, phoneNumber);
          return `Berikut Poli yang tersedia:\n${poliTersedia.join("\n")}`
        case "2":

          Helpers.setCache("step", "tunggu formulir", phoneNumber);
          return await ReplyService.reply("Silahkan klik link dibawah ini untuk mendaftar http://localhost:8080/registration", '', 'link')

      }
    } else {
      Helpers.delCache('state', phoneNumber)
      Helpers.delCache('step', phoneNumber)
      return IntentService.onIntent(input, phoneNumber);
    }
  }
}
