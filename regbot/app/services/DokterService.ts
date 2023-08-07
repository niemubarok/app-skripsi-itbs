import Database from "@ioc:Adonis/Lucid/Database";
import Helpers from "App/utils/Helpers";
import EntityService from "./EntityService";
import ReplyService from "./ReplyService";

export default class DokterService {
  public static async jadwalDokter(phoneNumber: number, name: string,) {
    try {
      const [jadwalDokter] = await Database.rawQuery(
        "select jadwal.hari_kerja, jadwal.jam_mulai, jadwal.jam_selesai, jadwal.kd_poli,dokter.nm_dokter from jadwal inner join dokter on jadwal.kd_dokter = dokter.kd_dokter where dokter.nm_dokter like ?",
        [`%${name}%`]
      );
      const _jadwalDokter = jadwalDokter
        .map(
          (
            item: { hari_kerja: string; jam_mulai: any; jam_selesai: any },
            index: number
          ) => {
            const hari_kerja =
              item.hari_kerja.charAt(0).toUpperCase() +
              item.hari_kerja.slice(1).toLowerCase();
            const waktu = `${item.jam_mulai} s/d ${item.jam_selesai}`;
            return `${index + 1}. ${hari_kerja} (${waktu})`;
          }
        )
        .join("\n");

      Helpers.setCache("jadwalDokter", jadwalDokter, phoneNumber);
      return `Berikut jadwal dokter ${jadwalDokter[0]?.nm_dokter}\n ${_jadwalDokter}`

      return ReplyService.reply(`Berikut jadwal dokter ${jadwalDokter[0]?.nm_dokter}\n ${_jadwalDokter}`);
    } catch (error) {
      console.error("error di jadwalDokter", error);

    }
  }

  public static async getDokterSesuaiPoliDanHari(
    phoneNumber: number,
    namaPoli: string
  ) {
    try {
      const tanggalPeriksa = await EntityService.tanggalPeriksa(phoneNumber);

      const [[poli]] = await Database.rawQuery(
        "select * from poliklinik where nm_poli like ?",
        [`%${namaPoli}%`]
      );
      const [jadwal] = await Database.rawQuery(
        "select distinct(dokter.nm_dokter), jadwal.kd_dokter, jadwal.kd_poli from jadwal inner join dokter on jadwal.kd_dokter = dokter.kd_dokter where jadwal.kd_poli = ? and jadwal.hari_kerja = ?",
        [poli.kd_poli, Helpers.dateToDayForDB(tanggalPeriksa)]
      );

      const namaDokter = jadwal
        .map((item: { nm_dokter: string }, index: number) => {
          return `${index + 1}. ${item.nm_dokter}`;
        })
        .join("\n");

      // return jadwal;
      Helpers.setCache("data dokter", jadwal, phoneNumber);
      Helpers.setCache("data poli", poli, phoneNumber);

      const hari = Helpers.dateToDayForDisplay(tanggalPeriksa as string)
      const tanggal = Helpers.formatDateForDisplay(tanggalPeriksa as string)
      // return Helpers.dateToDayForDisplay(tanggalPeriksa as string)
      return `Berikut dokter ${namaPoli} untuk ${hari},${tanggal} :\n ${namaDokter}`;
    } catch (error) {
      console.error("error di getDokterSesuaiPoliDanHari", error);
    }
  }

  public static async getSelectedDokter(index: string, phoneNumber: number) {
    const cachedDokter = await Helpers.getCache("data dokter", phoneNumber);
    // const cachedDokter = _cachedDokter ? JSON.parse(_cachedDokter as string) : null
    const selectedDokter = cachedDokter
      ? cachedDokter[parseInt(index) - 1]
      : null;
    return selectedDokter;
  }

  public static async getDokterByName(name: string) {
    try {
      const [[dokter]] = await Database.rawQuery(
        `SELECT kd_dokter FROM dokter WHERE nm_dokter LIKE '%${name}%'`
      );

      const [[dokterDiTabelJadwal]] = await Database.rawQuery(
        `SELECT jadwal.kd_dokter, jadwal.kd_poli, dokter.nm_dokter
          FROM jadwal
          INNER JOIN dokter ON jadwal.kd_dokter = dokter.kd_dokter
          WHERE jadwal.kd_dokter = ?`,
        [dokter?.kd_dokter]
      );

      if (!dokterDiTabelJadwal) {
        return ""
      }

      const { kd_dokter, kd_poli, nm_dokter } = dokterDiTabelJadwal;
      return { kd_dokter, kd_poli, nm_dokter };
    } catch (error) {
      console.error("error di getDokterByName", error);
    }
  }

  public static async getDokterByKode(kodeDokter: string) {
    try {
      const [[dokterDiTabelJadwal]] = await Database.rawQuery(
        `SELECT jadwal.kd_dokter, jadwal.kd_poli, dokter.nm_dokter
           FROM jadwal
           INNER JOIN dokter ON jadwal.kd_dokter = dokter.kd_dokter
           WHERE jadwal.kd_dokter = ?`,
        [kodeDokter]
      );

      if (!dokterDiTabelJadwal) {
        return ""
      }

      const { kd_dokter, kd_poli, nm_dokter } = dokterDiTabelJadwal;
      return { kd_dokter, kd_poli, nm_dokter };
    } catch (error) {
      console.error("error di getDokterByKode", error);

    }
  }

  public static async jadwalDokterPerTanggal(phoneNumber: number, namaDokter: string) {
    try {
      const tanggalPeriksa = await EntityService.tanggalPeriksa(phoneNumber);
      const { kd_dokter }: any = await this.getDokterByName(namaDokter);
      const query = `
      select distinct(dokter.nm_dokter), jadwal.kd_dokter, jadwal.kd_poli, jadwal.hari_kerja,
      jadwal.jam_mulai, jadwal.jam_selesai
      from jadwal
      inner join dokter on jadwal.kd_dokter = dokter.kd_dokter
      where jadwal.kd_dokter = ? and jadwal.hari_kerja = ?`;
      const [[dokter]] = await Database.rawQuery(query, [kd_dokter, Helpers.dateToDayForDB(tanggalPeriksa)]);
      return dokter;
    } catch (error) {
      console.error("Error in jadwalDokterPerTanggal:", error);
      throw error;
    }
  }
}
}

