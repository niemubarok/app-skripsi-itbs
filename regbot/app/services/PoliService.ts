import Database from "@ioc:Adonis/Lucid/Database";
import Helpers from "App/utils/Helpers";
import EntityService from "./EntityService";
import JadwalService from "./JadwalService";
import BookingService from "./BookingService";
import DokterService from "./DokterService";

export default class PoliService {

  public static async poliFromCache(phoneNumber: number, index: number = 0) {
    const cachedPoli: any = await Helpers.getCache("data poli", phoneNumber);
    if (Array.isArray(cachedPoli)) {
      return index === 0 ? cachedPoli[0] : cachedPoli[index - 1];
    } else {
      return JSON.parse(cachedPoli);
    }
  }
  public static async jadwalPoli(phoneNumber: number, index: number = 0) {

    const poliFromCache = await this.poliFromCache(phoneNumber, index);
    const namaPoli = poliFromCache.nm_poli
    const kodePoli = poliFromCache.kd_poli
    // return poliFromCache
    try {

      const _jadwalPoli = await Database.rawQuery(
        "select jadwal.kd_poli,jadwal.hari_kerja, jadwal.jam_mulai, jadwal.jam_selesai, dokter.nm_dokter, dokter.kd_dokter from jadwal inner join dokter on jadwal.kd_dokter = dokter.kd_dokter where kd_poli = ?",
        [kodePoli]
      );

      let jadwalPoli = "";
      const uniqueDoctors = new Set<string>();
      Helpers.setCache(
        "jadwalPoli",
        JSON.stringify(_jadwalPoli[0]),
        phoneNumber
      );
      // Helpers.setCache("step", "pilih jadwal", phoneNumber);

      let lastIndex = 1;
      _jadwalPoli[0].forEach((jadwal: any) => {
        if (!uniqueDoctors.has(jadwal.nm_dokter)) {
          uniqueDoctors.add(jadwal.nm_dokter);

          const _jadwal = _jadwalPoli[0]
            .filter(
              (item: {
                [x: string]: any;
                hari_kerja: string;
                jam_mulai: any;
                jam_selesai: any;
              }) => item.nm_dokter === jadwal.nm_dokter
            )
            .map(
              (item: {
                hari_kerja: string;
                jam_mulai: any;
                jam_selesai: any;
              }) => {
                const hari_kerja =
                  item.hari_kerja?.charAt(0).toUpperCase() +
                  item.hari_kerja?.slice(1).toLowerCase();
                const tanggal = Helpers.convertDayToDate(hari_kerja);
                const waktu = `${item.jam_mulai.slice(
                  0,
                  5
                )} s/d ${item.jam_selesai.slice(0, 5)}`;
                let no = lastIndex;
                lastIndex++;

                return `${no}. ${hari_kerja}, ${tanggal} (${waktu})`;
              }
            )
            .join("\n");
          jadwalPoli += `${jadwal.nm_dokter}\n${_jadwal}\n\n`;
          // Helpers.setCache("jadwalPoli", _jadwalPoli, phoneNumber);
        }
      });

      return { namaPoli, jadwalPoli, _jadwalPoli };
    } catch (error) {
      console.error(error);
      return null
    }
  }

  public static async pilihJadwalPoli(phoneNumber: number, userMessage: string) {
    const jadwalPoli: any = await Helpers.getCache("jadwalPoli", phoneNumber)
    // return jadwalPoli
    if (!jadwalPoli) {
      return JadwalService.handleJadwal(phoneNumber)
    }
    const numberToChooseJadwalPoli = await Helpers.isNumberOfChoice(jadwalPoli.length, userMessage as string)
    if (numberToChooseJadwalPoli) {
      const selectedJadwalPoli = JSON.parse(jadwalPoli)[parseInt(userMessage as string) - 1]
      // return selectedJadwalPoli
      const dayToDate: any = Helpers.convertDayToDate(selectedJadwalPoli?.hari_kerja)
      Helpers.setCache("tanggal periksa", dayToDate, phoneNumber)
      const dokter = await DokterService.getDokterByKode(selectedJadwalPoli?.kd_dokter)
      const poli = await PoliService.getPoliByKode(selectedJadwalPoli?.kd_poli)

      Helpers.setCache("data dokter", JSON.stringify(dokter), phoneNumber)
      Helpers.setCache("data poli", JSON.stringify(poli), phoneNumber)
      return await BookingService.handleBooking(phoneNumber)
    }
  }

  public static async jadwalPoliPerTanggal(phoneNumber: number) {

    // const poliFromCache = await this.poliFromCache(phoneNumber, index);
    const tanggalPeriksa: any = await EntityService.tanggalPeriksa(phoneNumber)
    const hari = Helpers.dateToDayForDB(tanggalPeriksa)
    const namaPoli = await EntityService.namaPoli(phoneNumber)
    const { kd_poli }: any = await this.getPoliByLikeNama(namaPoli)

    // return hari
    // return poliFromCache
    try {

      const _jadwalPoli = await Database.rawQuery(
        "select jadwal.kd_poli,jadwal.hari_kerja, jadwal.jam_mulai, jadwal.jam_selesai, dokter.nm_dokter, dokter.kd_dokter from jadwal inner join dokter on jadwal.kd_dokter = dokter.kd_dokter where kd_poli = ? AND jadwal.hari_kerja = ?",
        [kd_poli, hari]
      );

      let jadwalPoli = "";
      const uniqueDoctors = new Set<string>();
      Helpers.setCache(
        "jadwalPoli",
        JSON.stringify(_jadwalPoli[0]),
        phoneNumber
      );
      // Helpers.setCache("step", "pilih jadwal", phoneNumber);

      _jadwalPoli[0].forEach((jadwal: any) => {
        if (!uniqueDoctors.has(jadwal.nm_dokter)) {
          uniqueDoctors.add(jadwal.nm_dokter);

          const _jadwal = _jadwalPoli[0]
            .filter(
              (item: {
                [x: string]: any;
                hari_kerja: string;
                jam_mulai: any;
                jam_selesai: any;
              }) => item.nm_dokter === jadwal.nm_dokter
            )
            .map(
              (item: {
                hari_kerja: string;
                jam_mulai: any;
                jam_selesai: any;
              }) => {
                // const hari_kerja =
                //     item.hari_kerja?.charAt(0).toUpperCase() +
                //     item.hari_kerja?.slice(1).toLowerCase();
                // // const tanggal = Helpers.convertDayToDate(hari_kerja);
                const waktu = `${item.jam_mulai.slice(
                  0,
                  5
                )} s/d ${item.jam_selesai.slice(0, 5)}`;

                return `🕜(${waktu})`;
              }
            )
            .join("\n");
          jadwalPoli += `- ${jadwal.nm_dokter} ${_jadwal}\n`;
        }
      });

      return `Berikut jadwal poli ${namaPoli} untuk ${hari}, ${Helpers.formatDateForDisplay(tanggalPeriksa)}\n${jadwalPoli}`;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async getAllNamaPoli() {
    return await Database.rawQuery(
      "select kd_poli,nm_poli from poliklinik order by nm_poli"
    );
  }

  public static async getPoliByLikeNama(namaPoli: string) {
    const [[query]] = await Database.rawQuery(
      "select * from poliklinik where nm_poli like ? ",
      [`%${namaPoli}%`]
    );

    // const result = query && query[0] && query[0][0]
    if (!query) {
      return "";
    }


    const { kd_poli, nm_poli, registrasilama } = query;

    return {
      kd_poli,
      nm_poli,
      registrasilama,
    };
  }

  public static async getPoliByNama(namaPoli: string) {
    const [[query]] = await Database.rawQuery(
      "select * from poliklinik where nm_poli = ? ",
      [namaPoli]
    );

    // const result = query && query[0] && query[0][0]
    if (!query) {
      return "";
    }


    const { kd_poli, nm_poli, registrasilama } = query;

    return {
      kd_poli,
      nm_poli,
      registrasilama,
    };
  }

  public static async getPoliByKode(kodePoli: string) {
    const [[query]] = await Database.rawQuery(
      "select * from poliklinik where kd_poli = ?",
      [kodePoli]

    );

    if (!query) {
      return "";
    }


    const { kd_poli, nm_poli, registrasilama } = query;

    return {
      kd_poli,
      nm_poli,
      registrasilama
    }
  }

  public static async getNamaPoliFromJadwal() {
    return await Database.rawQuery(
      "SELECT DISTINCT poliklinik.nm_poli, jadwal.kd_poli from jadwal inner join poliklinik on jadwal.kd_poli = poliklinik.kd_poli"
    );
  }
}
