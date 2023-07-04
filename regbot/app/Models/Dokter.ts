import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import JadwalDokter from './Jadwal'

export default class Dokter extends BaseModel {
  @belongsTo(() => JadwalDokter)
  public jadwal: BelongsTo<typeof JadwalDokter>

  @column({ isPrimary: true })
  public kd_dokter: string

  @column()
  public nm_dokter: string

  @column()
  public jk: 'L' | 'P'

  @column()
  public tmp_lahir: string

  @column.date()
  public tgl_lahir: DateTime

  @column()
  public gol_drh: 'A' | 'B' | 'O' | 'AB' | '-'

  @column()
  public agama: string

  @column()
  public almt_tgl: string

  @column()
  public no_telp: string

  @column()
  public stts_nikah: 'BELUM MENIKAH' | 'MENIKAH' | 'JANDA' | 'DUDHA'

  @column()
  public kd_sps: string

  @column()
  public alumni: string

  @column()
  public no_ijn_praktek: string

  @column()
  public status: '0' | '1'

  public static table = 'dokter'
}
