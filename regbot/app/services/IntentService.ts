import Helpers from "App/utils/Helpers";
import EntityService from "./EntityService";
import PasienService from "./PasienService";
import MenuService from "./MenuService";
import JadwalService from "./JadwalService";
import ReplyService from "./ReplyService";
const { dockStart } = require("@nlpjs/basic");

export default class IntentService {
  public static async onIntent(
    userMessage: string,
    phoneNumber: number
  ) {

    // return "onIntent"

    const dock = await dockStart();

    const initNlp = dock.get("nlp", {
      language: "id",
      useCache: true
    });
    await initNlp.train();

    const nlpResult = await initNlp.process("id", userMessage);
    const entities = nlpResult?.entities ? nlpResult?.entities : [];

    // return entities
    console.log("entities di intentService", entities[0]?.entity);

    Helpers.setCache("entities", JSON.stringify(entities), phoneNumber);
    const intent = nlpResult?.intent ? nlpResult?.intent : []
    const intents = nlpResult.classifications
      .filter((s: { score: number }) => s.score > 0)
      .map((s: { intent: any }) => s.intent);

    // const missingEntity = await EntityService.checkEntities(phoneNumber);
    // return missingEntity

    console.log("intent di intentService", intent);
    let answers: any = [];
    const isGreeting = () => {
      // const regex = /^((pagi|siang|sore|malam)\b|\b(pagi|siang|sore|malam)\b)/i;
      const greetings = ["selamat pagi", "selamat siang", "selamat sore", "selamat malam"];
      const match = greetings.some((greeting: string) => nlpResult?.utterance.includes(greeting));
      return match ? match[0] : null;
    }
    if (intents.length == 0 || nlpResult.utterance == 0 || !intent) {
      Helpers.setCache("state", "menu", phoneNumber);
      return MenuService.listMenu(phoneNumber)
    }

    console.log("entitygreeting", entities[0]?.entity == "greeting");

    if (isGreeting()) {
      answers.push(EntityService.greeting(isGreeting()))
    } else if (entities[0]?.entity == "greeting") {
      answers.push(EntityService.greeting(entities[0]?.option));
      // answers.push(greetingReplies);
    }

    let askAttempt = await Helpers.getAskAttempt(nlpResult.intent, phoneNumber);
    if (intents.includes("pendaftaran")) {
      //ambil data pasien dari database
      const patients = await PasienService.getPatient({ phone: phoneNumber });

      //jika pasien belum ada di database atau belum terdaftar
      if (patients?.length === 0) {
        //Kembali ke menu utama
        Helpers.setCache("step", "tunggu formulir", phoneNumber);
        answers.push(`Silahkan klik link berikut untuk mendaftar\n${process.env.REG_URI}`)
      } else if (patients?.length > 0 && askAttempt == 0) {
        //cek apakah ada pasien terdaftar dengan nomor tersebut
        answers.push(
          `Sebelum melanjutkan, apakah ingin mendaftarkan salah satu pasien berikut?`
        );
        patients.forEach((patient: any, index: number) => {
          answers.push(`${index + 1}. ${patient.nm_pasien}`);
        });

        Helpers.setCache("dataPasien", JSON.stringify(patients), phoneNumber);
        Helpers.setCache("step", "pilih pasien", phoneNumber);
        Helpers.setCache("state", "booking", phoneNumber);
        // Helpers.setCache("previousMessage", answers, phoneNumber);
        Helpers.setCache(
          "entities",
          JSON.stringify(entities),
          phoneNumber
        );
        // Helpers.setAskAttempt(nlpResult.intent, 1, phoneNumber);

        answers.push(
          "Jika ya, silahkan balas dengan angka yang sesuai\n Jika ingin mendaftar dengan pasien lain silahkan balas dengan angka *0*"
        );
      }

    } else if (intents.includes("tanya jadwal")) {
      const replyJadwal = await JadwalService.handleJadwal(phoneNumber);
      // return replyJadwal

      answers.push(replyJadwal);

    } else if (nlpResult?.intent == "thanks") {
      answers.push("Terima kasih kembali 🙏")
    }


    if (askAttempt == 1) {
      Helpers.setCache("state", "menu", phoneNumber);
    }
    return await ReplyService.reply(answers.join("\n"));
  }

  public static async detectIntent(input: string) {
    const dock = await dockStart();

    const nlp = dock.get("nlp");
    await nlp.train();

    // const checkedSpell = Helpers.spellCheck(input);
    const processedMessage = await nlp.process("id", input);
    return processedMessage.classifications
      .filter((s: { score: number }) => s.score > 0)
      .map((s: { intent: any }) => s.intent);
  }
}
