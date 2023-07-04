import Helpers from "App/utils/Helpers";
import PoliService from "./PoliService";
import IntentService from "./IntentService";
import MenuService from "./MenuService";

import PasienService from "./PasienService";
import EntityService from "./EntityService";
import BookingService from "./BookingService";
import DokterService from "./DokterService";
import JadwalService from "./JadwalService";

export default class StateService {
  public static async handleStep(phoneNumber: number, userMessage: string | number) {

    const step = await Helpers.getCache("step", phoneNumber)
    const state: any = await Helpers.getCache("state", phoneNumber)
    const askAttempt = await Helpers.getAskAttempt(state, phoneNumber)

    console.log("step di handleStep:", step);
    console.log("state di handleStep:", state);



    switch (step) {
      case "tunggu formulir":
        const extractedData: any = await Helpers.extractDataDariPesan(userMessage as string);
        // return extractedData
        // return (userMessage as string).includes('📋');

        if (!(userMessage as string).includes('📋') || userMessage == '0') {
          Helpers.delCache("step", phoneNumber)
          Helpers.delCache("state", phoneNumber)
          return MenuService.listMenu(phoneNumber)
        }

        if ((userMessage as string).includes('📋')) {
          const dokter = await DokterService.getDokterByName(extractedData.dokterTujuan)
          Helpers.setCache("data dokter", JSON.stringify(dokter), phoneNumber)
          const poli = await PoliService.getPoliByNama(extractedData.poliTujuan);
          Helpers.setCache("data poli", JSON.stringify(poli), phoneNumber)
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

      case "pilih pasien":
        const { cachedPasien, pasien: selectedPasien }: any = await EntityService.pasien(phoneNumber, userMessage as number);
        const numberToChoosePasien = await Helpers.isNumberOfChoice(cachedPasien.length, userMessage as string)
        console.log("askAttemtp di pilih pasien", askAttempt);

        if (!numberToChoosePasien) {
          if (askAttempt == 1) {
            return MenuService.listMenu(phoneNumber)
          }

          Helpers.setAskAttempt(step, 1, phoneNumber)
          // Helpers.delCache("step", phoneNumber)

          return "Anda belum memilih pasien, silahkan pilih sesuai angka yang tersedia."
        }


        if (numberToChoosePasien) {
          Helpers.setCache("dataPasien", JSON.stringify(selectedPasien), phoneNumber)
          Helpers.setCache("state", "booking", phoneNumber)
          Helpers.delCache("step", phoneNumber)

          return await JadwalService.handleJadwal(phoneNumber, state)
        }

        Helpers.delCache("state", phoneNumber)
        return IntentService.onIntent(userMessage as string, phoneNumber)


      case "pilih poli":
      case "jadwal poli":
        // return "jadwal Poli"
        const poli: any = await Helpers.getCache('data poli', phoneNumber)
        const numberToChoose = await Helpers.isNumberOfChoice(poli.length, userMessage as string)
        // return numberToChoose

        if (askAttempt == 1) {
          Helpers.delCache("step", phoneNumber)
          return IntentService.onIntent(userMessage as string, phoneNumber)
        }
        if (!numberToChoose) {
          Helpers.setAskAttempt(step, 1, phoneNumber)
          console.log("askAttempt", askAttempt);

          if (state == "booking") {
            return "Anda belum memilih poli, silahkan pilih sesuai angka yang tersedia.\nSilahkan balas dengan angka '0' untuk kembali ke menu utama"
          } else {
            Helpers.setCache("state", "menu", phoneNumber)
          }
          return IntentService.onIntent(userMessage as string, phoneNumber)
        }

        // if (state == "tanya jadwal") {
        const jadwal = await PoliService.jadwalPoli(phoneNumber, userMessage as number);
        // return typeof jadwal?.jadwalPoli
        if (jadwal == null) {
          return JadwalService.handleJadwal(phoneNumber)
        }

        console.log("state di jadwal poli ", state);

        if (state == "booking") {
          Helpers.setCache("jadwalPoli", JSON.stringify(jadwal?._jadwalPoli[0]), phoneNumber)
          return await PoliService.pilihJadwalPoli(phoneNumber, userMessage as string)
        } else {
          Helpers.delCache("state", phoneNumber)
          Helpers.delCache("step", phoneNumber)
        }

        return `Berikut Jadwal ${jadwal?.namaPoli}:\n${jadwal?.jadwalPoli}\n`;
      // }

      //     const jadwal = await PoliService.jadwalPoli(phoneNumber, userMessage as number);
      //     if (!jadwal) {
      //         return JadwalService.handleJadwal(phoneNumber)
      //     }

      //     return jadwal
      //     // return await BookingService.handleBooking(phoneNumber)
      // }
      // break;

      case "jadwal dokter":
      case "pilih jadwal dokter":
        const jadwalDokter: any = await Helpers.getCache("jadwalDokter", phoneNumber)
        const numberToChooseJadwalDokter = await Helpers.isNumberOfChoice(jadwalDokter.length, userMessage as string)

        if (numberToChooseJadwalDokter) {
          const selectedJadwalDokter = jadwalDokter[parseInt(userMessage as string) - 1]
          const dayToDate: any = Helpers.convertDayToDate(selectedJadwalDokter.hari_kerja)
          Helpers.setCache("tanggal periksa", dayToDate, phoneNumber)
          const dokter = await DokterService.getDokterByName(selectedJadwalDokter.nm_dokter)
          const poli = await PoliService.getPoliByKode(selectedJadwalDokter.kd_poli)
          Helpers.setCache("data dokter", JSON.stringify(dokter), phoneNumber)
          Helpers.setCache("data poli", JSON.stringify(poli), phoneNumber)
          return await BookingService.handleBooking(phoneNumber)
        }
      case "pilih dokter":
      case "pilih jadwal poli":
        return await PoliService.pilihJadwalPoli(phoneNumber, userMessage as string)
      default:
        return IntentService.onIntent(userMessage as string, phoneNumber)
    }

  }
}
