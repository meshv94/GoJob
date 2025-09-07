import fs from 'fs';
import path from 'path';

export function deleteUploadedFile(relativePath) {
  try {
    const absolutePath = path.join(process.cwd(), 'Uploads', relativePath.replace(/^.*?(images|pdf|csv)/, '$1'));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (err) {
    throw err;
  }
}