import Database from "@ioc:Adonis/Lucid/Database";
import Helpers from "App/utils/Helpers";
import EntityService from "./EntityService";
import ReplyService from "./ReplyService";


// const cache = new NodeCache()

export default class BookingService {
  public static async handleBooking(phoneNumber: number) {

    const { cachedPasien, pasien }: any = await EntityService.pasien(phoneNumber);
    const pasienToStore = cachedPasien ? JSON.parse(cachedPasien) : JSON.parse(pasien);
    const { cachedDokter, dokter }: any = await EntityService.dokter(phoneNumber);
    const dokterToStore = cachedDokter ? JSON.parse(cachedDokter) : JSON.parse(dokter);
    const { cachedPoli, poli }: any = await EntityService.poliklinik(phoneNumber);
    const poliToStore = cachedPoli ? JSON.parse(cachedPoli) : JSON.parse(poli);

    const getTanggalPeriksa: any = await EntityService.tanggalPeriksa(phoneNumber);
    const tanggalPeriksa: any = Helpers.formatDateForDB(getTanggalPeriksa as string);

    // return Helpers.formatDateForDB(tanggalPeriksa)
    // const tanggalBooking = await Helpers.getCurrentDate()
    const jamBooking = new Date().toLocaleTimeString("en-US", {
      hour12: false,
    });


    // return pasienToStore

    let dataPendaftaran = {
      tgl_registrasi: tanggalPeriksa,
      jam_reg: jamBooking,
      kd_dokter: dokterToStore ? dokterToStore.kd_dokter : '',
      no_rkm_medis: pasienToStore ? pasienToStore?.no_rkm_medis : '',
      kd_poli: poliToStore ? poliToStore.kd_poli : '',
      p_jawab: pasienToStore ? pasienToStore.namakeluarga : '',
      almt_pj: pasienToStore ? pasienToStore.alamatpj : '',
      hubunganpj: pasienToStore ? pasienToStore.keluarga : '',
      biaya_reg: poliToStore ? poliToStore.registrasilama : '',
      stts: 'Belum',
      stts_daftar: 'Baru',
      status_lanjut: 'Ralan',
      kd_pj: pasienToStore ? pasienToStore.kd_pj : '',
      umurdaftar: pasienToStore ? await Helpers.getAgeNumber(pasienToStore?.umur) : '',
      sttsumur: pasienToStore ? await Helpers.getAgeString(pasienToStore?.umur) : '',
      status_bayar: 'Belum Bayar',
      status_poli: 'Baru',
    }

    // return dataPendaftaran

    // const isRegistered = await Database.from('reg_periksa').whereIn(['no_rkm_medis', 'kd_dokter', 'tgl_registrasi'], [data.no_rkm_medis, data.kd_dokter, tglRegistrasi])
    const [[dataReg]] = await Database.rawQuery(
      `SELECT reg_periksa.no_reg, reg_periksa.tgl_registrasi,pasien.nm_pasien, dokter.nm_dokter, poliklinik.nm_poli, jadwal.jam_mulai, jadwal.jam_selesai
            FROM reg_periksa
            INNER JOIN jadwal ON reg_periksa.kd_dokter = jadwal.kd_dokter
            INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
            INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
            INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
            WHERE reg_periksa.kd_dokter = ?
            AND reg_periksa.tgl_registrasi = ?
            AND reg_periksa.no_rkm_medis = ?`,
      [dataPendaftaran.kd_dokter, tanggalPeriksa, dataPendaftaran.no_rkm_medis]
    );

    if (dataReg) {
      const jamDatang = await Helpers.jamDatang(dataReg.jam_mulai, dataReg.jam_selesai, dataReg.no_reg);
      Helpers.delCache("state", phoneNumber);
      Helpers.delCache("step", phoneNumber);
      return `Anda sebelumnya sudah terdaftar dengan detail pendaftaran berikut:
            \nTanggal Periksa: ${Helpers.formatDateForDisplay(
        dataReg.tgl_registrasi
      )}
            \nNama Pasien: ${dataReg.nm_pasien}
            \nNama Dokter: ${dataReg.nm_dokter}
            \nPoli: ${dataReg.nm_poli}
            \nJam Datang : ${jamDatang}
            \nNo Antrian: ${dataReg.no_reg}`;
    }
    // return Helpers.formatDate(tgl_registrasi)

    let [[{ last_no_reg }]] = await Database.rawQuery(
      "SELECT LPAD(CAST((COALESCE(MAX(no_reg), 0) + 1) AS CHAR), 3, '0') AS last_no_reg FROM reg_periksa WHERE reg_periksa.kd_dokter = ? AND reg_periksa.tgl_registrasi = ?",
      [dataPendaftaran.kd_dokter, tanggalPeriksa]
    );
    const [[no_rawat_akhir]] = await Database.rawQuery(
      "SELECT MAX(no_rawat) AS no_urut_rawat FROM reg_periksa WHERE tgl_registrasi = ?",
      [tanggalPeriksa]
    );

    const no_urut_rawat =
      no_rawat_akhir.no_urut_rawat !== null
        ? no_rawat_akhir.no_urut_rawat.substr(12, 6)
        : "00000";

    const tgl_reg_no_rawat = tanggalPeriksa
      ? tanggalPeriksa.substring(0, 10).split("-").join("/")
      : null;
    const no_rawat =
      tgl_reg_no_rawat +
      "/" +
      (parseInt(no_urut_rawat) + 1).toString().padStart(6, "0");

    if (dataPendaftaran) {
      const dataToInsert = {
        no_reg: last_no_reg,
        no_rawat,
        ...(dataPendaftaran || {}),
      };

      const trx = await Database.transaction();
      try {
        await trx.insertQuery().table("reg_periksa").insert(dataToInsert);

        await trx.commit();
        // console.log(trx);


        // const [result] = await Database.table('reg_periksa').returning('id').insert(dataPendaftaran);

        const [[regDetail]] = await Database.rawQuery(
          `SELECT reg_periksa.no_reg, reg_periksa.tgl_registrasi,reg_periksa.no_rkm_medis, pasien.nm_pasien, dokter.nm_dokter, poliklinik.nm_poli, jadwal.jam_mulai, jadwal.jam_selesai
            FROM reg_periksa
            INNER JOIN jadwal ON reg_periksa.kd_dokter = jadwal.kd_dokter
            INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
            INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
            INNER JOIN pasien ON reg_periksa.no_rkm_medis = pasien.no_rkm_medis
            WHERE reg_periksa.no_rawat = ?`,
          [no_rawat]
        );



        const jamDatang = await Helpers.jamDatang(regDetail.jam_mulai, regDetail.jam_selesai, regDetail.no_reg);

        // return regDetail
        Helpers.delCache("state", phoneNumber);
        Helpers.delCache("step", phoneNumber);
        const hariDanTanggal = `${Helpers.dateToDayForDisplay(tanggalPeriksa)}, ${Helpers.formatDateForDisplay(
          regDetail.tgl_registrasi
        )}`
        const qrcode = await Helpers.generateQRCode(
          no_rawat
        )

        const message = '✅Anda sudah terdaftar' +
          '\n\n___Detail Pendaftaran___' +
          `\nNama: *${regDetail.nm_pasien}*` +
          `\nNo. RM: *${regDetail.no_rkm_medis}*` +
          `\nKlinik : *${regDetail.nm_poli}*` +
          `\nDokter: *${regDetail.nm_dokter}*` +
          '\nTanggal Periksa: *' +
          hariDanTanggal +
          '*' +
          // "\nJam praktek : pkl+ ${jamMulai} s/d ${jamSelesai}+" +
          `\n*Estimasi dipanggil: ${jamDatang}*` +
          '\nNo. Antrian : *' +
          regDetail.no_reg +
          '*' +
          '\n_________________________________' +
          '\n⚠️ *PASTIKAN ANDA HADIR PADA SAAT DIPANGGIL*' +
          '\n_Jika tidak hadir setelah 3x panggilan, nomor anda akan dipanggil TERAKHIR_' +
          '\n__________________________________' +
          '\n\n💡Tunjukan pesan ini kepada petugas pendaftaran di Lobby utama.' +
          '\n\n🙏Terimakasih telah mempercayakan kesehatan keluarga anda di *RS Ali Sibroh Malisi*'
        'AYO❗️❗️ LAWAN COVID-19🦠\n\n' +
          '↔️ MENJAGA JARAK\n' +
          '🙌🏼 MENCUCI TANGAN SETIAP 20 MENIT\n' +
          '😷 MENGGUNAKAN MASKER  '

        return await ReplyService.replyMedia(message, qrcode);

        // return `
        //     Anda sudah terdaftar
        //     \n\n--Detail Pendaftaran--
        //     \nNama: *${regDetail.nm_pasien}*
        //     \nNo. RM: *${regDetail.no_rkm_medis}*
        //     \nPoli Tujuan : *${regDetail.nm_poli}*
        //     \nDokter: *${regDetail.nm_dokter}*
        //     \nTanggal Periksa: *${Helpers.formatDateForDisplay(
        //   regDetail.tgl_registrasi
        // )}*
        //     \nJam praktek : pkl. ${regDetail.jam_mulai.slice(
        //   0,
        //   5
        // )} s/d ${regDetail.jam_selesai.slice(0, 5)}
        //     \nNo. Antrian : *${regDetail.no_reg}*

        //     \n\n*Datanglah sesuai jam praktek dokter.*

        //     \n\nTunjukan pesan ini kepada petugas pendaftaran di Lobby utama.

        //     \n\nTerimakasih telah mempercayakan kesehatan keluarga anda di RS Ali Sibroh Malisi
        //     \nSemoga lekas sembuh`;
      } catch (error) {
        console.log(error);

        await trx.rollback();
      }
    } else {
      return "gagal";
    }
  }
}
