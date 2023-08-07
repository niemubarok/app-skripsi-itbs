import Helpers from "App/utils/Helpers";
import IntentService from "./IntentService";
import MenuService from "./MenuService";
// import TanyaJadwalService from "./TanyaJadwalService";
import JadwalService from "./JadwalService";
import StepService from "./StepService";

export default class StateService {
  public static async handleState(userMessage: string, phoneNumber: number) {
    console.log("handle state");

    const botState: any = await Helpers.getCache("state", phoneNumber);
    console.log("botState", botState);

    const states = {
      menu: MenuService.handleMenu,
      booking: StepService.handleStep,
      "tanya jadwal": JadwalService.handleJadwal,
    };
    const intentHandler = states[botState] || IntentService.onIntent;
    return intentHandler(userMessage, phoneNumber);

    // switch (botState) {
    //   case "menu":
    //     return MenuService.handleMenu(userMessage, phoneNumber);
    //   case `booking`:
    //     return StepService.handleStep(phoneNumber, userMessage);
    //   case "tanya jadwal":
    //     return JadwalService.handleJadwal(phoneNumber);

    //   default:
    //     // if (nlpResult.intent) {
    //     return IntentService.onIntent(userMessage, phoneNumber);
    //   // }
    // }
  }
}
