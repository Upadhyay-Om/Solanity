import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto'

const uploadDir = 'uploads/';
// Tells node that id 'uploads' doesn't exist make one 
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        //random uuid
        const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
        // Files og name 
        const ext = path.extname(file.originalname);
        // Final name 
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}` );
    },
});

export const upload = multer({ storage });