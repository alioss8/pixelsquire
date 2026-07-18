import { randomBytes ,createHash } from "crypto"; 
import { prisma } from "./db";
const hash = (s: string) => createHash('sha256').update(s).digest('hex')

export async function registerDevice(platform: 'EXTENSION' | 'PWA', timezone: string) {
 const secret = randomBytes(32).toString("base64url")
 const device = await prisma.device.create({
    data:{
        secretHash:hash(secret),
        platform:platform,
        timezone:timezone,
        user : {create:{}},
    },
 })
 return { deviceId: device.id, token: `${device.id}.${secret}` }
}

export async function authenticate(authHeader:string |null) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null; // ya da throw new Error("Yetkisiz erişim");
    };

    const token = authHeader.slice(7).trim() 
    const [deviceId, secret] = token.split('.');

     if (!deviceId || !secret) {
        return null;
    }
    const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: { user: true }, 
    });
        
    if (!device){
        return null;
    }
    if (device.secretHash !== hash(secret)){
         return null
    } 
    return device
}