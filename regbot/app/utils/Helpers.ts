import NodeCache from "node-cache";
import QRCode from "qrcode"
import * as path from 'path';

const Typo = require("typo-js");
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });


export default class Helpers {

  public static async generateQRCode(text: string) {

    return await QRCode.toDataURL(text).then((url) => {
      return url
    })

  }
  public static setCache(key: string, value: string, phoneNumber: number) {
    cache.set(`${key}-${phoneNumber}`, value, 10000);
  }

  public static async getCache(key: string, phoneNumber: number) {
    try {
      const cacheKey = `${key}-${phoneNumber}`;
      const cachedData = await cache.get(cacheKey);
      return cachedData;
    } catch (error) {
      return null;
      // console.error(error);
      // throw error;
    }
  }

  public static delCache(key: string, phoneNumber: number) {
    cache.del(`${key}-${phoneNumber}`);
  }

  public static spellCheck(input: any) {
    // Membuat objek dictionary dengan kamus bahasa Indonesia
    const dictionary = new Typo("id_ID", false, false, {
      dictionaryPath: path.join(__dirname, "dictionaries"),
    });

    // Mengecek kata yang diinput
    const words = input.split(" ");
    const incorrectWords: string[] = [];

    for (const word of words) {
      if (word.length > 2) {
        if (!dictionary.check(word)) {
          incorrectWords.push(word);
        }
      }
    }

    if (incorrectWords.length === 0) {
      // console.log(`${input} adalah kalimat yang benar`);
      return input;
    } else {
      // console.log(`${input} adalah kalimat yang salah`);
      // console.log(`Kata yang salah: ${incorrectWords.join(", ")}`);

      // Menampilkan saran kata yang mirip
      const suggestions = {};
      for (const word of incorrectWords) {
        const wordSuggestions = dictionary.suggest(word);
        suggestions[word] = wordSuggestions.slice(0, 3);
      }
      // Membuat saran kalimat baru
      const replaceWords = {
        tgl: "tanggal",
        utk: "untuk",
      };
      const correctedWords = words.map((word: string) => {
        return replaceWords[word] || suggestions[word]?.[0] || word;
      });
      const correctedSentence = correctedWords.join(" ");
      // console.log("correctedSentence", correctedSentence);

      return correctedSentence;
    }
  }



  public static async checkForKTPNumber(message: string): Promise<boolean> {
    const ktpRegex = /\b\d{16}\b/gm; // matches 16-digit numbers
    return ktpRegex.test(message); // returns true if there is a match
  }

  public static async extractKTPNumber(
    message: string
  ): Promise<string | null> {
    if (!message || typeof message !== "string") {
      return null; // returns null if message is undefined, null, or not a string
    }
    const ktpRegex = /\b\d{16}\b/gm; // matches 16-digit numbers
    const match = message.match(ktpRegex);
    if (match) {
      return match[0]; // returns the first match
    }
    return ""; // returns null if there is no match
  }

  public static async extractDateTime(message: string): Promise<{
    date: Date | null;
    dayOfWeek: string | null;
    timeOfDay: string | null;
    hour: number | null;
  }> {
    // const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})/g;
    const dateRegex = /(\d{1,2}-\w{3}-\d{2})/;
    const dayOfWeekRegex = /\b(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/gi;
    const timeOfDayRegex = /\b(pagi|siang|sore|malam)\b/gi;
    const hourRegex = /(\d{1,2})(:|\.)?(\d{2})?(am|pm)?/gi;

    const dateMatch = message.match(dateRegex)?.[0];
    const dayOfWeekMatch = message.match(dayOfWeekRegex)?.[0];
    const timeOfDayMatch = message.match(timeOfDayRegex)?.[0];
    const hourMatch = message.match(hourRegex)?.[0];

    const date = dateMatch ? new Date(dateMatch) : null;
    let hour = hourMatch
      ? parseInt(hourMatch.replace(/[:.]/g, "").replace(/(am|pm)/gi, ""))
      : null;
    if (hour !== null && hourMatch?.toLowerCase().includes("pm")) {
      hour += 12;
    }

    return {
      date,
      dayOfWeek: dayOfWeekMatch ?? null,
      timeOfDay: timeOfDayMatch ?? null,
      hour,
    };
  }


  public static setDateString(date: Date, phoneNumber: number): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const dateString = `${yyyy}-${mm}-${dd}`;
    Helpers.setCache("tanggal periksa", dateString, phoneNumber);
    return dateString;
  }

  public static convertHariOption(hari: string): number {
    switch (hari.toLowerCase()) {
      case "senin":
        return 1;
      case "selasa":
        return 2;
      case "rabu":
        return 3;
      case "kamis":
        return 4;
      case "jumat":
        return 5;
      case "sabtu":
        return 6;
      case "minggu":
        return 0;
      default:
        return -1;
    }
  }

  public static async getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  public static convertTo24Hour(time: string): string | null {
    const hourRegex = /(\d{1,2})(:|\.)?(\d{2})?(am|pm)?/gi;
    const match = time.match(hourRegex);
    if (!match) {
      return null; // returns null if there is no match
    }
    const hourString = match[1];
    const minuteString = match[3] || "00";
    const period = match[4];
    let hour = parseInt(hourString);
    if (period === "pm" && hour !== 12) {
      hour += 12; // add 12 to the hour for pm times (except for 12pm)
    } else if (period === "am" && hour === 12) {
      hour = 0; // set the hour to 0 for 12am
    }
    return `${hour.toString().padStart(2, "0")}:${minuteString}`;
  }

  public static convertDayToDate(dayName: string): string | null {
    const daysOfWeek = [
      "ahad",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    const dayIndex = daysOfWeek.indexOf(dayName.toLowerCase());

    // If the day name is not valid, return null
    if (dayIndex === -1) {
      return null;
    }

    const now = new Date();
    const diff = dayIndex - now.getDay() + (dayIndex < now.getDay() ? 7 : 0);
    const targetDate = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);

    const dateStr = targetDate.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    return dateStr.split("/").join("-");
  }

  public static dateToDayForDB(tanggal: any) {
    const daftarHari = [
      "Ahad",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const tanggalObj = new Date(tanggal);
    const hari = tanggalObj.getDay();
    return daftarHari[hari];
  }
  public static dateToDayForDisplay(tanggal: any) {
    const daftarHari = [
      "Ahad",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const tanggalObj = new Date(tanggal);
    const hari = tanggalObj.getDay();
    return daftarHari[hari];
  }

  public static formatJamPraktek(jam: string) {
    return jam.slice(0, -3);
  }

  public static async jamDatang(mulai: string, selesai: string, no_reg: string): Promise<string> {
    const jamMulai = mulai.slice(0, -3)
    const jamSelesai = selesai.slice(0, -3)

    const menit = jamMulai.slice(-2)

    if (parseInt(no_reg) <= 10) {
      return `${jamMulai.slice(0, -3)}:${menit} s/d ${parseInt(jamMulai.slice(0, -3)) + 1
        }:${menit}`
    } else {
      return `${parseInt(jamMulai.slice(0, -3)) + 1}:${menit} s/d ${jamSelesai}`
    }
  }

  public static setAskAttempt(
    state: string,
    value: number,
    phoneNumber: number
  ): void {
    cache.set(`askAttempt-${phoneNumber}-${state}`, value, 1000);
  }

  public static async getAskAttempt(
    state: string | unknown,
    phoneNumber: number
  ): Promise<string | null | undefined | number | {}> {
    console.log("state di getAskAttempt", state);

    const attempt = await cache.get(`askAttempt-${phoneNumber}-${state}`);
    return parseInt(attempt as string) || 0;
  }

  public static async dayToHari(str: string) {
    const strTotime = Date.parse(str);
    const tentukanHari = new Date(strTotime).toLocaleString("en-US", {
      weekday: "short",
    });
    const day = {
      Sun: "AKHAD",
      Mon: "SENIN",
      Tue: "SELASA",
      Wed: "RABU",
      Thu: "KAMIS",
      Fri: "JUMAT",
      Sat: "SABTU",
    };

    const hari = day[tentukanHari];
    return hari;
  }

  public static async calculateAge(birthDate: string | number | Date) {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let ageYear = today.getFullYear() - birthDateObj.getFullYear();
    let ageMonth = today.getMonth() - birthDateObj.getMonth();
    let ageDay = today.getDate() - birthDateObj.getDate();

    if (ageMonth < 0 || (ageMonth === 0 && ageDay < 0)) {
      ageYear--;
      ageMonth += 12;
    }

    if (ageDay < 0) {
      const daysInLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      ageMonth--;
      ageDay += daysInLastMonth;
    }

    const ageYearStr = ageYear > 0 ? `${ageYear} Th ` : "";
    const ageMonthStr = ageMonth > 0 ? `${ageMonth} Bl ` : "";
    const ageDayStr = ageDay > 0 ? `${ageDay} Hr` : "";

    return `${ageYearStr}${ageMonthStr}${ageDayStr}`;
  }

  public static async getAgeString(ageStr: string) {
    const ageParts = ageStr.split(" ");
    if (ageParts[0] === "0" && ageParts[1] === "Th") {
      return "Bl";
    } else if (
      ageParts[0] === "0" &&
      ageParts[1] === "Th" &&
      ageParts[2] === "0" &&
      ageParts[3] === "Bl"
    ) {
      return "Hr";
    } else {
      return ageStr;
    }
  }

  public static async getAgeNumber(ageStr: string): Promise<number> {
    // return ageStr ? parseInt(ageStr) : 0;
    const [first, , second, , third] = ageStr?.split(" ");
    if (first === "0" && second === "Th") {
      return parseInt(third);
    } else if (third === "0" && second === "Bl") {
      return parseInt(ageStr.split(" ")[4]);
    }
    return parseInt(first);
  }

  public static formatDateForDB(dateStr: string) {
    let formattedDate: string;
    if (dateStr.includes(" ")) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      formattedDate = `${year}-${month}-${day}`;
    } else {
      const [day, month, year] = dateStr.split("-");
      formattedDate = `${year}-${month}-${day}`;
    }

    console.log(`formattedDate: ${formattedDate}`);
    return formattedDate;
  }




  public static formatDateForDisplay(dateStr: string) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = [day, month, year].join("-");

    console.log(formattedDate); // output: "29-05-2023"
    return formattedDate;
  }

  public static async cekJamPraktek(tanggalPeriksa: string, time: any) {
    const currentDate = new Date().getDate();
    //   const selectedDate = new Date(
    //     store.doctor.state.searchDate.value
    //   ).getDate();
    const _tanggalPeriksa = new Date(tanggalPeriksa).getDate();
    const currentHour = new Date().getHours();
    const jadwalPraktek = time.split(":")[0];
    // if()
    return currentHour >= jadwalPraktek && _tanggalPeriksa === currentDate;
  }

  public static async getHari(dayNumber: number) {
    const listHari = ['akhad', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
    // const getDayNumber = DateTime.now().get('day')
    // console.log(listHari[dayNumber])

    return listHari[dayNumber]
  }


  public static async isNumberOfChoice(length: number, choice: string) {
    const lastDigit = length % 10;
    // const numberToChoose = length < 10 ? new RegExp(`^([1-${length > 9 ? length : 9}])$`) : new RegExp(`^(10|1[0-${lastDigit}])$`)
    const numberToChoose = length < 9 ? new RegExp(`^([1-${length}])$`) : new RegExp(`^([1-9]|10|1[0-${lastDigit}])$`);
    console.log("numberToChoose", numberToChoose);

    return numberToChoose.test(choice.trim());
  }

  public static async extractDataDariPesan(text: string) {
    const regexPasienBaru = /pasien baru/gi;
    const matchPasienBaru = regexPasienBaru.exec(text);
    const pasienBaru = matchPasienBaru?.[0];

    const data = text.split('\n').reduce((acc, curr) => {
      const [key, value] = curr.split(':').map(s => s.trim());
      if (key && value) {
        const formattedKey = key.replace(/\./g, '').replace(/\s+/g, '_').toLowerCase();
        acc[formattedKey] = value;
      }
      return acc;
    }, {});

    const mappedData = Object.keys(data).reduce((acc, curr) => {
      const words = curr.split('_');
      const formattedKey = words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      acc[formattedKey] = data[curr];
      return acc;
    }, {});

    if (pasienBaru) {
      mappedData['pasienBaru'] = true;

    } else {
      mappedData['pasienBaru'] = false
    }
    // if (pasienLama) mappedData['pasienLama'] = true;

    return mappedData
  }

}
