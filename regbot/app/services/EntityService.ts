import Helpers from "App/utils/Helpers";
import DokterService from "./DokterService";
import PoliService from "./PoliService";
import { dockStart } from '@nlpjs/basic';

export default class GreetingService {



  public static async addNamedEntity(entityName: string, examples: string[]): Promise<void> {
    const dock = await dockStart({ use: ['Basic'] });
    const nlp = dock.get('nlp');

    // Train the model with the existing data
    // await nlp.addCorpus('./corpus-id.json');
    await nlp.train();

    // Add the new entity to the model
    const entity = nlp.addNamedEntity(entityName);
    examples.forEach(example => {
      entity.addEntry(example, [entityName]);
    });

    // Save the updated model
    await nlp.save();
  }

  public static async entities(phoneNumber: number) {
    const _cachedEntities = await Helpers.getCache("entities", phoneNumber) ? await Helpers.getCache("entities", phoneNumber) : null
    const cachedEntities = _cachedEntities ? JSON.parse(_cachedEntities as string) : null
    const entities = cachedEntities ? cachedEntities : null
    console.log("entities di greetingService", entities);

    return entities
  }

  public static async checkEntities(phoneNumber: number) {
    const requiredEntities = ["dokter", "poliklinik", "waktu", "hari"];
    const entities = await this.entities(phoneNumber)
    // console.log(entities);

    if (entities) {
      const entityArray = (await Promise.resolve(entities)) as unknown[];
      return requiredEntities.filter(
        (entity: string) =>
          !entityArray.some((e: { entity: string }) => e.entity === entity)
      );
    }
  }

  public static greeting(entity: string) {
    console.log("entity in greeting:", entity);


    switch (entity) {
      case 'salam':
        return "Wa'alaikumussalam";
        break;
      case 'halo':
        return 'Halo';
        break;
      case 'selamat pagi':
      case 'pagi':
        return 'Selamat Pagi';
        break;
      case 'selamat siang':
      case 'siang':
        return 'Selamat Siang';
        break;
      case 'selamat sore':
      case 'sore':
        return 'Selamat Sore';
        break;
      case 'selamat malam':
      case 'malam':
        return 'Selamat Malam';
        break;
      default:
        return '';
    }
  }

  // public static greeting(entity: string, phoneNumber: number) {
  //   console.log("entity in greeting:", entity);


  //   switch (entity) {
  //     case 'salam':
  //       Helpers.setCache('greeting', "Wa'alaikumussalam", phoneNumber);
  //       break;
  //     case 'halo':
  //       Helpers.setCache('greeting', 'Halo', phoneNumber);
  //       break;
  //     case 'selamat pagi':
  //     case 'pagi':
  //       Helpers.setCache('greeting', 'Selamat Pagi', phoneNumber);
  //       break;
  //     case 'selamat siang':
  //     case 'siang':
  //       Helpers.setCache('greeting', 'Selamat Siang', phoneNumber);
  //       break;
  //     case 'selamat sore':
  //     case 'sore':
  //       Helpers.setCache('greeting', 'Selamat Sore', phoneNumber);
  //       break;
  //     case 'selamat malam':
  //     case 'malam':
  //       Helpers.setCache('greeting', 'Selamat Malam', phoneNumber);
  //       break;
  //   }
  // }

  // public static async tanggalPeriksa(phoneNumber: number) {
  //   const entities = await this.entities(phoneNumber);
  //   const waktu = entities?.find((e: any) => e.entity === "waktu")?.option;
  //   // const hari = entities?.find((e: any) => e.entity === "hari")?.option;

  //   const allowedOptions = ["pagi", "siang", "sore", "malam", "hari ini", "besok", "lusa"];
  //   const cachedTanggalPeriksa = await Helpers.getCache("tanggal periksa", phoneNumber);
  //   if (cachedTanggalPeriksa) {
  //     return cachedTanggalPeriksa;
  //   }

  //   const date = new Date();
  //   if (allowedOptions.includes(waktu)) {
  //     switch (waktu) {
  //       case "besok":
  //         date.setDate(date.getDate() + 1);
  //         break;
  //       case "lusa":
  //         date.setDate(date.getDate() + 2);
  //         break;
  //     }
  //     return Helpers.setDateString(date, phoneNumber);
  //   } else if (waktu) {
  //     const hariIni = new Date();
  //     const hariIniStr = Helpers.setDateString(hariIni, phoneNumber);
  //     const hariIniNum = new Date(hariIniStr).getDay();
  //     const hariOption = Helpers.convertHariOption(waktu);
  //     const diff = hariOption - hariIniNum;

  //     if (diff < 0) {
  //       date.setDate(date.getDate() + diff + 7);
  //     } else if (diff === 0) {
  //       return hariIniStr;
  //     } else {
  //       date.setDate(date.getDate() + diff);
  //     }
  //     return Helpers.setDateString(date, phoneNumber);
  //   }
  // }

  public static async tanggalPeriksa(phoneNumber: number) {
    const entities = await this.entities(phoneNumber);
    const waktu = entities?.find((e: any) => e.entity === "waktu")?.option;
    const hari = entities?.find((e: any) => e.entity === "waktu")?.option;

    const allowedOptions = ["pagi", "siang", "sore", "malam", "hari ini", "besok", "lusa"];
    const hariOptions = ["akhad", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];


    const date = new Date();
    if (allowedOptions.includes(waktu)) {
      switch (waktu) {
        case "besok":
          date.setDate(date.getDate() + 1);
          break;
        case "lusa":
          date.setDate(date.getDate() + 2);
          break;
      }
      return Helpers.setDateString(date, phoneNumber);
    } else if (hariOptions.includes(hari)) {
      const hariIni = new Date();
      const hariIniStr = Helpers.setDateString(hariIni, phoneNumber);
      const hariIniNum = new Date(hariIniStr).getDay();
      const hariOption = Helpers.convertHariOption(hari);
      // return hariOption
      console.log("hariOption", hariOption);

      const diff = hariOption - hariIniNum;

      if (diff < 0) {
        date.setDate(date.getDate() + diff + 7);
      } else if (diff === 0) {
        return hariIniStr;
      } else {
        date.setDate(date.getDate() + diff);
      }

      const cachedTanggalPeriksa = await Helpers.getCache("tanggal periksa", phoneNumber);
      console.log("cachedTanggalPeriksa", cachedTanggalPeriksa != date);
      // return date
      if (cachedTanggalPeriksa != date) {
        return Helpers.setDateString(date, phoneNumber);
      }
      return cachedTanggalPeriksa;
    }
  }




  // public static async tanggalPeriksa(phoneNumber: number) {

  //     const entities = await this.entities(phoneNumber)
  //     const waktu = entities ? entities.find((e: any) => e.entity === "waktu")?.option : null

  //     const allowedOptions = ["pagi", "siang", "sore", "malam", "hari ini", "besok", "lusa"];
  //     const cachedTanggalPeriksa = await Helpers.getCache("tanggal periksa", phoneNumber);
  //     if (cachedTanggalPeriksa) {
  //         return cachedTanggalPeriksa
  //     }

  //     const date = new Date();
  //     if (allowedOptions.includes(waktu)) {
  //         switch (waktu) {
  //             case "besok":
  //                 date.setDate(date.getDate() + 1);
  //                 break;
  //             case "lusa":
  //                 date.setDate(date.getDate() + 2);
  //                 break;

  //         }
  //         const dd = String(date.getDate()).padStart(2, '0');
  //         const mm = String(date.getMonth() + 1).padStart(2, '0');
  //         const yyyy = date.getFullYear();

  //         const dateString = `${yyyy}-${mm}-${dd}`;
  //         Helpers.setCache("tanggal periksa", dateString, phoneNumber)
  //         return dateString
  //     }
  // }

  public static async pasien(phoneNumber: number, index: number = 1000) {
    const cachedPasien = await Helpers.getCache("dataPasien", phoneNumber) as string | string[] | null;
    // return JSON.parse(cachedPasien as string)[index - 1]
    // let pasien = {}
    // if (Object.keys(dataPasien).length !== 0) {
    //     pasien = dataPasien
    // } else {

    const pasien = Array.isArray(JSON.parse(cachedPasien as string)) && index !== 1000 ? JSON.parse(cachedPasien as string)[index - 1] : cachedPasien;



    // console.log("cachedPasien", cachedPasien);
    // console.log("pasien", pasien);


    return { cachedPasien, pasien };
  }
  public static async dokter(phoneNumber: number, index: string = '0') {


    const entities = await this.entities(phoneNumber)
    const namaDokter = entities ? entities.find((e: any) => e.entity === "dokter")?.option : null
    const dokterFromEntities = namaDokter ? await DokterService.getDokterByName(namaDokter) : ''
    if (dokterFromEntities !== '') {
      Helpers.setCache("data dokter", JSON.stringify(dokterFromEntities), phoneNumber)
    }


    const _cachedDokter = await Helpers.getCache("data dokter", phoneNumber) ? await Helpers.getCache("data dokter", phoneNumber) : null
    const cachedDokter = _cachedDokter ? _cachedDokter : []

    const dokter: any = cachedDokter
    // const missingEntity: any = await this.checkEntities(phoneNumber);
    // if (missingEntity.includes("poliklinik")) {
    // return cachedDokter
    if (dokter?.kd_poli) {
      const poli = await PoliService.getPoliByKode(dokter.kd_poli);
      Helpers.setCache("data poli", JSON.stringify(poli), phoneNumber)
    }
    // }
    return { cachedDokter, dokter }
  }


  public static async namaDokter(phoneNumber: number) {
    const entities = await this.entities(phoneNumber)
    return await this.entities(phoneNumber)
      ? entities.find((e: any) => e.entity === "dokter")?.option
      : null;
  }

  public static async poliklinik(phoneNumber: number, index: number = 0) {
    const entities = await this.entities(phoneNumber)
    const namaPoli = entities ? entities.find((e: any) => e.entity === "poliklinik")?.option : null
    let poliFromEntities: any = ''
    if (namaPoli !== null) {
      poliFromEntities = await PoliService.getPoliByLikeNama(namaPoli)

      if (poliFromEntities !== '') {
        Helpers.setCache("data poli", JSON.stringify(poliFromEntities), phoneNumber)
      }
    }

    // const { dokter } = await this.dokter(phoneNumber)
    // if (dokter) {
    //     poliFromEntities = await PoliService.getPoliByKode(dokter.kd_dokter)
    //     Helpers.setCache("data poli", JSON.stringify(poliFromEntities), phoneNumber)
    // }

    // if(this.dokter)

    const _cachedPoli = await Helpers.getCache("data poli", phoneNumber) ? await Helpers.getCache("data poli", phoneNumber) : null
    const cachedPoli = _cachedPoli ? _cachedPoli : []

    const poli = poliFromEntities == '' ? cachedPoli[index - 1] : poliFromEntities
    return { cachedPoli, poli }

  }

  public static async namaPoli(phoneNumber: number) {
    const entities = await this.entities(phoneNumber)
    return entities ? entities.find((e: any) => e.entity === "poliklinik")?.option : null
  }
}
