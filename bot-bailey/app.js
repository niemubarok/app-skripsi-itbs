import BaileysClass from "./baileys.js";
import "./utils.js";

const bot = new BaileysClass(null);

import axios from "axios";
// const fs = require('fs')
import express from "express";
import bodyParser from "body-parser";
import { writeBase64ToFile } from "./utils.js";
const app = express();
app.use(bodyParser.json());

// async function saveQRCodeToFileBase64(qrCodeValue, filePath) {
//   // Generate QR code in base64 format
//   const base64QRCode = await qrcode.toDataURL(qrCodeValue);

//   // Write the base64QRCode to a file
//   fs.writeFileSync(filePath, base64QRCode, 'base64');
// }

//Menerima request dari rebot untuk kirim pesan setelah pasien scan qrcode

app.post("/send", async (req, res) => {
  let contact = (await req.body.contact) + "@c.us";
  let message = await req.body.message;
  let source = await req.body.qrcode;

  console.log(source);

  // client.sendImage(contact, source, "filename", message)
  // res.write("pesan terkirim")
  // res.end()
});

app.listen("3000", "127.0.0.1", () => {
  console.log("running");
});

bot.on("auth_failure", async (error) => console.log("ERROR BOT: ", error));
bot.on("qr", (qr) => console.log("NEW QR CODE: ", qr));
bot.on("ready", async () => console.log("READY BOT"));

bot.on("message", async (message) => {
  console.log(message.body);
  let data = message.body;
  // let contactId = message.from
  let contactId = "6285711525459@c.us";
  console.log(message.from);

  let contact = message.from.replace("@c.us", "");

  axios
    .post("http://127.0.0.1:3333/bot/hook", {
      // data: {
      phoneNumber: message.from,
      message: data,
      // {
      //     type: "chat",
      //     pesan: data,
      //     timestamp: message.t,
      // },

      // }
    })
    .then(async (response) => {
      let res = await response.data;
      const message = res?.message ? res.message : res;
      let type = res.type ? res.type : "";
      // let caption = await res.caption;
      console.log("type", type);
      let source = res.source ? res.source : "";

      if (type == "media") {
        await writeBase64ToFile(source, "qrcode.png");
        await bot.sendImage(contact, "qrcode.png", message);
      } else {
        await bot.sendText(contact, message);
      }
    })
    .catch(async (error) => {
      console.log(error);
      await bot.sendText(
        contactId,
        "Mohon maaf sepertinya ada kendala, silahkan hubungi nomor berikut:"
      );
      console.error("Error when sending: ", error); //return object error
    });
});
