import fs from "fs";

export const writeBase64ToFile = async (base64Data, filePath) => {
  // Menghapus informasi header pada Base64 Data
  const base64WithoutHeader = base64Data.split(";base64,").pop();

  // Mengubah Base64 menjadi buffer
  const bufferData = Buffer.from(base64WithoutHeader, "base64");

  // Menyimpan bufferData ke file
  fs.writeFileSync(filePath, bufferData);
};
