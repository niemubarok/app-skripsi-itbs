import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Booking extends BaseModel {
  public static table = "booking_registrasi"

  @column({ isPrimary: true })
  public no_rkm_medis: string

  @column.date()
  public tanggal_periksa: DateTime

  @column()
  public kd_dokter: string

  @column()
  public kd_poli: string

  @column()
  public no_reg: string

  @column()
  public kd_pj: string

  @column()
  public limit_reg: number

  @column.dateTime()
  public waktu_kunjungan: DateTime

  @column.date()
  public tanggal_booking: DateTime

  @column.time()
  public jam_booking: DateTime

  @column()
  public status: 'Terdaftar' | 'Belum' | 'Batal' | 'Dokter Berhalangan'
}
