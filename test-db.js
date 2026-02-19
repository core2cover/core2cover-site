const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // Load environment variables
const prisma = new PrismaClient();

async function main() {
    console.log("Testing DB Connection...");
    try {
        const count = await prisma.seller.count();
        console.log(`Successfully connected. Found ${count} sellers.`);
    } catch (e) {
        console.error("DB Connection Failed!");
        console.error("Error Message:", e.message);
        console.error("Error Code:", e.code);
    } finally {
        await prisma.$disconnect();
    }
}

main();
