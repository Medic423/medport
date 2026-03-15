const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const trip = await prisma.transportRequest.findUnique({
    where: { id: 'cmmpcdhi200024lcaxk2lxtel' },
    select: { id: true, status: true, createdByUserId: true, selectedAgencies: true }
  });
  console.log('Trip:', JSON.stringify(trip, null, 2));

  const responses = await prisma.agencyResponse.findMany({
    where: { tripId: 'cmmpcdhi200024lcaxk2lxtel' }
  });
  console.log('Agency Responses (' + responses.length + '):', JSON.stringify(responses, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
