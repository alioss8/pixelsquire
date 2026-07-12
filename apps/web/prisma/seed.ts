 import { PrismaClient } from "@prisma/client";
 import { PrismaPg} from "@prisma/adapter-pg";
 import messages from './messages.json'

 const adapter = new PrismaPg({connectionString:process.env.DATABASE_URL})
 const prisma = new PrismaClient({adapter})

 async function main (){
    await prisma.message.deleteMany()
    const rows = []
    for (const [category , texts] of Object.entries(messages)){
        for (const text of texts as string[]){
            rows.push({category:category as any , text, locale: 'en'})
        }
    }
    await prisma.message.createMany({data:rows})
    console.log(`Seeded ${rows.length} messages`)
 }
 
main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })