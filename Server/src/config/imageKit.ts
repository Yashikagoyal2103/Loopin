const ImageKit: any = require("imageKit");
import dotenv from "dotenv";
dotenv.config();

export var imageKit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY ,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY ,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
});