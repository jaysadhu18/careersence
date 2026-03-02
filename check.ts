import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const trees = await prisma.careerTree.findMany();
    console.log('Total trees:', trees.length);
    if (trees.length > 0) {
        console.log(trees[0]);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
