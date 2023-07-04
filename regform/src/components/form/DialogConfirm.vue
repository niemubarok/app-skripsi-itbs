<template>
  <q-dialog v-model="store.components.state.dialogConfirm" persistent>
    <q-card>
      <q-banner class="bg-secondary text-bold text-primary"><q-avatar color="primary" size="sm"
          text-color="secondary"><strong>3</strong></q-avatar>
        KONFIRMASI</q-banner>

      <q-card-section>
        <q-chip class="bg-transparent">
          Mohon cek kembali data pasien di bawah ini!
        </q-chip>

        <table>
          <tr>
            <td>NIK</td>
            <td>: {{ store.patient.detail.nik }}</td>
          </tr>
          <tr>
            <td>Nama Pasien</td>
            <td>: {{ store.patient.detail.name }}</td>
          </tr>
          <tr>
            <td>Tgl. Lahir</td>
            <td>: {{ store.patient.formattedBirthDate() }}</td>
          </tr>
          <!-- <tr>
            <td>No. HP</td>
            <td>: {{ store.patient.detail.phone }}</td>
          </tr>-->
          <tr>
            <td>Dokter Tujuan</td>
            <td>: {{ store.doctor.state.selected.name }}</td>
          </tr>
          <tr>
            <td>Klinik</td>
            <td>: {{ store.doctor.state.selected.specialist() }}</td>
          </tr>
          <tr>
            <td>Jenis Bayar</td>
            <td>: {{ store.patient.detail.jnsBayar }}</td>
          </tr>
          <tr v-if="isBPJS">
            <td>No. Peserta: {{ store.patient.detail.noBPJS }}</td>
          </tr>
          <tr>
            <td>Tanggal Periksa</td>
            <td>: {{ store.patient.formattedTglPeriksa() }}</td>
          </tr>
        </table>
      </q-card-section>
      <!-- <q-banner > -->
      <q-checkbox v-model="accept" class="text-weight-medium full-width q-px-md q-py-sm"
        :class="accept ? 'bg-secondary text-grey-3' : 'bg-red-2 text-grey-10'" size="md" color="secondary" dense
        label="Saya menyatakan bahwa data di atas sudah benar" />
      <!-- </q-banner> -->

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Cancel" color="primary" @click="onclosePopUp" />

        <q-btn :disable="!accept" label="Daftarkan" rounded color="secondary text-accent" @click="onSubmit">
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useQuasar, date } from "quasar";
import { inject, ref, onBeforeMount, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const $q = useQuasar();

    const store = inject("store");
    const TglLahir = ref("");
    const $router = useRouter();
    const accept = ref(false);
    const isBPJS = computed(() => {
      return store.patient.detail.jnsBayar == "BPJS"
    })

    const onclosePopUp = () => {
      store.components.state.isConfirm = false;
      accept.value = false;
    };

    const onSubmit = () => {

      const message = ref('')


      // \nPekerjaan: ${store.patient.detail.pekerjaan}
      if (store.patient.detail.isPasienBaru) {
        message.value = `📋 *Pendaftaran Pasien Baru*
        ${isBPJS.value ? `\nNo. Peserta: ${store.patient.detail.noBPJS}` : ''}
        \nNo. KTP: ${store.patient.detail.nik}
        \nNama Pasien: ${store.patient.detail.name}
        \nTempat Lahir: ${store.patient.detail.tmp_lahir}
        \nTanggal Lahir: ${store.patient.formattedBirthDate()}
        \nJenis Kelamin: ${store.patient.detail.jk}
        \nAlamat: ${store.patient.detail.alamat}
        \nStatus Nikah: ${store.patient.detail.stts_nikah}
        \nAgama: ${store.patient.detail.agama}
        \nNama Ibu: ${store.patient.detail.nm_ibu}
        \nGol. Darah: ${store.patient.detail.gol_darah}
        \nCara Bayar: ${store.patient.detail.jnsBayar}
        \nPoli Tujuan: ${store.doctor.state.selected.specialist()}
        \nDokter Tujuan: ${store.doctor.state.selected.name}
        \nTanggal Berobat: ${store.patient.formattedTglPeriksa()}`
      } else {
        message.value = `📋 *Pendaftaran Pasien Lama*
        \nNo. KTP: ${store.patient.detail.nik}
        \nNama Pasien: ${store.patient.detail.name}
        \nTanggal Lahir: ${store.patient.formattedBirthDate()}
        \nCara Bayar: ${store.patient.detail.jnsBayar}
        \nPoli Tujuan: ${store.doctor.state.selected.specialist()}
        \nDokter Tujuan: ${store.doctor.state.selected.name}
        \nTanggal Berobat: ${store.patient.formattedTglPeriksa()}`
      }


      const encodedMessage = encodeURIComponent(message.value)
      const url = `https://wa.me/6285524914191/?text=${encodedMessage}`
      window.open(url, '_blank')

      $router.push("/registration");
      // if (accept.value !== true) {
      //   $q.notify({
      //     color: "red-5",
      //     textColor: "white",
      //     icon: "warning",
      //     message: "Silahkan checklist terelbih dahulu",
      //   });
      // } else {
      //   // if (!store.patient.detail.isPasienBaru) {
      //   axios
      //     .post(process.env.API_ENDPOINT + "pendaftaran", {
      //       data: {
      //         pasien: store.patient.detail,
      //         dokter: store.doctor.state.selected,
      //         tglPeriksa: store.patient.detail.tgl_periksa,
      //         kodeDokter: store.doctor.state.selected.id,
      //         namaDokter: store.doctor.state.selected.name,
      //         kodePoli: store.doctor.state.selected.kd_poli,
      //         namaPoli: store.doctor.state.selected.specialist(),
      //       },
      //     })
      //     .then((res) => {
      //       console.log(res);
      //       if (res.status == 201) {
      //         //JIKA BERHASIL MASUK DATABASE

      //         //ambil qrcode dan masukan ke state
      //         store.patient.registrationDetail.qrcode = res.data.qrcode;
      //         store.patient.registrationDetail.estimasiDipanggil =
      //           res.data.jamDatang;
      //         store.patient.registrationDetail.antrian = res.data.nomorAntrian;

      //         //TAMPILKAN NOTIFIKASI
      //         $q.notify({
      //           color: "green-4",
      //           textColor: "white",
      //           icon: "cloud_done",
      //           multiLine: true,
      //           message: `Berhasil Terdaftar, Kami mengirimkan detail pendaftaran via whatsapp di nomor berikut: ${store.patient.detail.phone} `,
      //           timeout: 0,
      //           actions: [
      //             {
      //               label: "Saya mengerti",
      //             },
      //           ],
      //         });

      //         //REDIRECT KE HALAMAN REGISTERED DENGAN DATA DARI BACKEND
      //         $router.push("/registration/detail");
      //       } else if (res.data.data.isRegistered) {
      //         store.patient.registrationDetail.qrcode = res.data.data.qrcode;
      //         store.patient.registrationDetail.estimasiDipanggil =
      //           res.data.data.jamDatang;
      //         store.patient.registrationDetail.antrian =
      //           res.data.data.nomorAntrian;
      //         //TAMPILKAN NOTIFIKASI
      //         $q.notify({
      //           color: "orange-4",
      //           textColor: "accent",
      //           icon: "event_available",
      //           message: `Sobat sibroh atas nama ${store.patient.detail.name
      //             } sebelumnya sudah terdaftar untuk tanggal ${store.patient.formattedTglPeriksa()}`,
      //           timeout: 0,
      //           type: "info",
      //           multiLine: true,
      //           actions: [
      //             {
      //               label: "Lihat Detail",
      //               color: "secondary",
      //               handler: () => {
      //                 $router.push("/registration/detail");
      //               },
      //             },
      //             {
      //               label: "Tutup",
      //               color: "grey-7",
      //             },
      //           ],
      //         });
      //       }
      //     });
      //   // }
      // }
    };

    onBeforeMount(() => {
      () => {
        store.patient.tgl_daftar = date.formatDate(new Date(), "YYYY-MM-DD");
      };
    });

    return {
      // confirmPatientData,
      store,
      accept,
      TglLahir,
      onclosePopUp,
      onSubmit,
      isBPJS
    };
  },
};
</script>

<style></style>
