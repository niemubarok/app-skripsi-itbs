import Database from "@ioc:Adonis/Lucid/Database";
import Pasien from "App/Models/Pasien";
import Helpers from "App/utils/Helpers";
import { DateTime } from "luxon";

interface PatientSearchParams {
  rm?: string;
  phone?: string | number;
  ktp?: any;
  name?: string;
  birthDate?: Date;
}
export default class PasienService {
  public static async getPatient(params: PatientSearchParams) {
    const { rm = "", phone = "", ktp = "", name = "" } = params;

    if (!rm && !phone && !ktp) {
      throw new Error("At least one parameter must be provided");
    }

    console.log(ktp);
    console.log("phone", phone);

    try {
      const patient = await Pasien.query()
        .select({
          no_rkm_medis: "no_rkm_medis",
          no_ktp: "no_ktp",
          nm_pasien: "nm_pasien",
          no_tlp: "no_tlp",
          namakeluarga: "namakeluarga",
          keluarga: "keluarga",
          alamatpj: "alamatpj",
          kd_pj: "kd_pj",
          umur: "umur",
        })
        // .orWhere('no_rkm_medis', rm)
        .where("no_tlp", phone)
      // .orWhere('no_ktp', ktp)
      // .orWhere((query) => query.whereILike('nm_pasien', `%${name}%`).andWhere('no_ktp', ktp))
      return patient;
    } catch (err) {
      console.error(err);
      throw new Error(
        `An error occurred while checking patient existence: ${err.message}`
      );
    }
  }

  public static async getPatientsByPhone(params: PatientSearchParams) {
    const { phone = "" } = params;

    try {
      return await Pasien.query().where("no_tlp", phone);
    } catch (err) {
      console.error(err);
      throw new Error(
        `An error occurred while checking patient existence: ${err.message}`
      );
    }
  }

  public static async storePasienBaru(phoneNumber: number, data: any) {

    // return data
    const noRM = async () => {
      //ambil no rm terakhir
      const lastRM = await Database.from('set_no_rkm_medis').first();

      //tambah 1
      const nextRM = Number(await lastRM?.no_rkm_medis) + 1;

      // return padNumber(nextRM, 6)
      return nextRM;
    }

    const [[penjab]] = await Database.rawQuery("select kd_pj from penjab where png_jawab like ?", [`%${data.caraBayar}%`])

    try {
      await Database.table('pasien')
        .insert({
          no_rkm_medis: await noRM(),
          nm_pasien: data.namaPasien,
          no_ktp: data.noKtp,
          jk: data.jenisKelamin,
          tmp_lahir: data.tempatLahir,
          tgl_lahir: Helpers.formatDateForDB(data.tanggalLahir),
          nm_ibu: data.namaIbu,
          alamat: data.alamat,
          gol_darah: data.golDarah,
          pekerjaan: '-',
          stts_nikah: data.statusNikah,
          agama: data.agama,
          tgl_daftar: Helpers.formatDateForDB(data.tanggalBerobat),
          no_tlp: phoneNumber,
          umur: await Helpers.calculateAge(data.tanggalLahir),
          pnd: '-',
          keluarga: data.hubungan,
          namakeluarga: data.penanggung,
          kd_pj: penjab.kd_pj,
          no_peserta: data.noBpjs,
          kd_kel: '80545',
          kd_kec: '1',
          kd_kab: '1',
          pekerjaanpj: '-',
          alamatpj: '-',
          kelurahanpj: 'KELURAHAN',
          kecamatanpj: 'KECAMATAN',
          kabupatenpj: 'KABUPATEN',
          perusahaan_pasien: '-',
          suku_bangsa: '1',
          bahasa_pasien: '5',
          cacat_fisik: '1',
          email: '-',
          nip: '-',
          kd_prop: '1',
          propinsipj: '-',
        })
        .then(async () => {
          await Database.from('set_no_rkm_medis').update({
            no_rkm_medis: await noRM(),
          })
        })

      const [[currentPatient]] = await Database.rawQuery("select * from pasien where no_ktp = ?", [data.noKtp])
      console.log("currentPatient", currentPatient);

      return currentPatient
    } catch (error) {
      return error
    }


  }
}
