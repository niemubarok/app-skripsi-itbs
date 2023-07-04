import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Registrasi extends BaseModel {
  public static table = "reg_periksa"

  @column()
  public no_reg: string

  @column({ isPrimary: true })
  public no_rawat: string

  @column.date()
  public tgl_registrasi: DateTime

  @column()
  public jam_reg: string

  @column()
  public kd_dokter: string

  @column()
  public no_rkm_medis: string

  @column()
  public kd_poli: string

  @column()
  public p_jawab: string

  @column()
  public almt_pj: string

  @column()
  public hubunganpj: string

  @column()
  public biaya_reg: number

  @column()
  public stts: 'Belum' | 'Sudah' | 'Batal' | 'Berkas Diterima'

  @column()
  public stts_daftar: '-' | 'Lama' | 'Baru'

  @column()
  public status_lanjut: 'Ralan' | 'Ranap'

  @column()
  public kd_pj: string

  @column()
  public umurdaftar: number

  @column()
  public sttsumur: 'Th' | 'Bl' | 'Hr'

  @column()
  public status_bayar: 'Sudah Bayar' | 'Belum Bayar'

  @column()
  public status_poli: 'Lama' | 'Baru'

}
