import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Pasien extends BaseModel {
  @column({ isPrimary: true })
  public no_rkm_medis: string

  @column()
  public nm_pasien: string

  @column()
  public no_ktp: string

  @column()
  public jk: 'L' | 'P'

  @column()
  public tmp_lahir: string

  @column.date()
  public tgl_lahir: DateTime

  @column()
  public nm_ibu: string

  @column()
  public alamat: string

  @column()
  public gol_darah: 'A' | 'B' | 'O' | 'AB' | '-'

  @column()
  public pekerjaan: string

  @column()
  public stts_nikah: 'BELUM MENIKAH' | 'MENIKAH' | 'JANDA' | 'DUDHA'

  @column()
  public agama: string

  @column.date()
  public tgl_daftar: DateTime

  @column()
  public no_tlp: string

  @column()
  public umur: string

  @column()
  public pnd: 'TS' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'SLTA/SEDERAJ...'

  @column()
  public keluarga: 'AYAH' | 'IBU' | 'ISTRI' | 'SUAMI' | 'SAUDARA'

  @column()
  public namakeluarga: string

  @column()
  public kd_pj: string

  @column()
  public no_peserta: string

  @column()
  public kd_kel: number

  @column()
  public kd_kec: number

  @column()
  public kd_kab: number

  @column()
  public pekerjaanpj: string

  @column()
  public alamatpj: string

  @column()
  public kelurahanpj: string

  @column()
  public kecamatanpj: string

  @column()
  public kabupatenpj: string

  @column()
  public perusahaan_pasien: string

  @column()
  public suku_bangsa: number

  @column()
  public bahasa_pasien: number

  @column()
  public cacat_fisik: number

  @column()
  public email: string

  @column()
  public nip: string

  @column()
  public kd_prop: number

  @column()
  public propinsipj: string

  public static table = 'pasien'
}
