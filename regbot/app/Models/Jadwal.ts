import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Dokter from './Dokter'

export default class JadwalDokter extends BaseModel {

  @hasMany(() => Dokter)
  public dokter: HasMany<typeof Dokter>

  @column({ isPrimary: true })
  public kd_dokter: string

  @column()
  public hari_kerja: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU' | 'AHAD'

  @column()
  public jam_mulai: string

  @column()
  public jam_selesai: string

  @column()
  public kd_poli: string

  @column()
  public kuota: number

  public static table = 'jadwal'
}
