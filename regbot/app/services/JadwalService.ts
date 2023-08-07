import Helpers from "App/utils/Helpers";
import EntityService from "./EntityService";
import PoliService from "./PoliService";
import DokterService from "./DokterService";
import BookingService from "./BookingService";

export default class JadwalService {
  public static async handleJadwal(phoneNumber: number, state: string = '') {

    const missingEntity = await EntityService.checkEntities(phoneNumber);
    // return missingEntity

    // return missingEntity?.includes("dokter") && !missingEntity?.includes("waktu")

    //Jika tidak menyertakan nama dokter dan nama poliklinik, kirim pilihan poliklinik dan pasien akan memilih poliklinik
    if (missingEntity?.includes("dokter") && missingEntity?.includes("waktu")) {
      // return "tidak ada nama dokter dan waktu"

      const namaPoli = await EntityService.namaPoli(phoneNumber);
      const poli: any = await PoliService.getPoliByLikeNama(namaPoli);
      Helpers.setCache("data poli", JSON.stringify(poli), phoneNumber);
      const jadwal = await PoliService.jadwalPoli(phoneNumber);

      if (state == 'tanya jadwal' || state == "menu") {

        Helpers.delCache("state", phoneNumber);
      }


      if (jadwal !== null) {
        if (state == 'booking') Helpers.setCache("step", "jadwal poli", phoneNumber);
        return `Berikut jadwal ${jadwal.namaPoli}:\n${jadwal.jadwalPoli}\n`;
      } else {

        const [namaPoliFromJadwal] = await PoliService.getNamaPoliFromJadwal();
        const poliTersedia = namaPoliFromJadwal.map(
          (poli: any, index: number) => {
            return `${index + 1}. ${poli.nm_poli}`;
          }
        );

        Helpers.setCache("step", "jadwal poli", phoneNumber);
        Helpers.setCache("data poli", namaPoliFromJadwal, phoneNumber);
        console.log("state di jadwal Service", state);


        return `Berikut Poli yang tersedia:\n${poliTersedia.join("\n")}`
      }

      //jika nama poli dan waktu tidak ada (hanya ada nama dokter)
    } else if (missingEntity?.includes("poliklinik") && missingEntity?.includes("waktu")) {
      // return "tidak ada nama poli dan waktu"
      const namaDokter = await EntityService.namaDokter(phoneNumber);
      if (state == 'booking') {
        Helpers.setCache("step", "pilih jadwal dokter", phoneNumber);
      }

      Helpers.delCache("state", phoneNumber);

      return await DokterService.jadwalDokter(phoneNumber, namaDokter);

      //jika nama dokter ada dan waktu ada
    } else if (!missingEntity?.includes("dokter") && !missingEntity?.includes("waktu")) {
      // return "nama dokter dan waktu ada"

      const namaDokter = await EntityService.namaDokter(phoneNumber);
      const jadwal = await DokterService.jadwalDokterPerTanggal(phoneNumber, namaDokter);
      // return jadwal
      if (!jadwal) {
        const jadwalDokter = await DokterService.jadwalDokter(phoneNumber, namaDokter);
        const tanggalPeriksa = await EntityService.tanggalPeriksa(phoneNumber);
        const hari = Helpers.dateToDayForDB(tanggalPeriksa)

        return `Mohon maaf tidak ada jadwal untuk hari ${hari}\n ${jadwalDokter}`
      }
      const tanggalPeriksa = Helpers.convertDayToDate(jadwal.hari_kerja);
      Helpers.delCache("state", phoneNumber);
      if (state == 'booking') {
        return BookingService.handleBooking(phoneNumber)
      }
      return `Dokter ${jadwal.nm_dokter} untuk hari ${jadwal.hari_kerja}, ${tanggalPeriksa} praktek pkl.\n${Helpers.formatJamPraktek(jadwal.jam_mulai)} s/d ${Helpers.formatJamPraktek(jadwal.jam_selesai)}\n`


      //jika nama poli ada
    } else if (!missingEntity?.includes("poliklinik") && !missingEntity?.includes("waktu")) {
      // return "hanya ada nama poli dan waktu"
      const poli: any = await PoliService.jadwalPoliPerTanggal(phoneNumber);
      Helpers.delCache("state", phoneNumber);
      return poli
      // } else if(missingEntity?.includes("poliklinik") && missingEntity?.includes("dokter")) {

    }
    else {

      return "null"

    }

  }
}
