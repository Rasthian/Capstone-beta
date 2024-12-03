
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

exports.uploadImageToFirebase = async (file) => {
    const bucket = admin.storage().bucket();
    const fileName = `${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
            reject(error);
        });

        stream.on('finish', async () => {
            // Make the file publicly accessible
            await fileUpload.makePublic();
            resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
        });

        stream.end(file.buffer);
    });
};