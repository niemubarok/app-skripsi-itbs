import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pasiens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('no_rkm_medis', 15).primary().notNullable()
      table.string('nm_pasien', 40).index()
      table.string('no_ktp', 20).index()
      table.enu('jk', ['L', 'P'])
      table.string('tmp_lahir', 15)
      table.date('tgl_lahir')
      table.string('nm_ibu', 40).notNullable()
      table.string('alamat', 200).index()
      table.enu('gol_darah', ['A', 'B', 'O', 'AB', '-'])
      table.string('pekerjaan', 60)
      table.enu('stts_nikah', ['BELUM MENIKAH', 'MENIKAH', 'JANDA', 'DUDHA'])
      table.string('agama', 12)
      table.date('tgl_daftar')
      table.string('no_tlp', 40)
      table.string('umur', 30).notNullable()
      table.enu('pnd', ['TS', 'TK', 'SD', 'SMP', 'SMA', 'SLTA/SEDERAJ...'])
      table.enu('keluarga', ['AYAH', 'IBU', 'ISTRI', 'SUAMI', 'SAUDARA'])
      table.string('namakeluarga', 50).notNullable()
      table.string('kd_pj', 3).notNullable()
      table.string('no_peserta', 25).index()
      table.integer('kd_kel').notNullable()
      table.integer('kd_kec').notNullable()
      table.integer('kd_kab').notNullable()
      table.string('pekerjaanpj', 35).notNullable()
      table.string('alamatpj', 100).notNullable()
      table.string('kelurahanpj', 60).notNullable()
      table.string('kecamatanpj', 60).notNullable()
      table.string('kabupatenpj', 60).notNullable()
      table.string('perusahaan_pasien', 8).index()
      table.integer('suku_bangsa').notNullable()
      table.integer('bahasa_pasien').notNullable()
      table.integer('cacat_fisik').notNullable()
      table.string('email', 50)
      table.string('nip', 30)
      table.integer('kd_prop').notNullable()
      table.string('propinsipj', 30).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
