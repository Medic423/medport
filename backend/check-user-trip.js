const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const userId = 'cmmmcch0z000xln8quxfa4dnh';
  const tripId = 'cmmpcdhi200024lcaxk2lxtel';

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, userType: true, organizationId: true }
  });
  console.log('User:', JSON.stringify(user, null, 2));

  const trip = await prisma.transportRequest.findUnique({
    where: { id: tripId },
    select: { id: true, status: true, createdByUserId: true, fromLocationId: true }
  });
  console.log('Trip:', JSON.stringify(trip, null, 2));

  // Check if trip would be visible to this user via getTrips logic
  if (user.userType === 'HEALTHCARE_ORGANIZATION_USER') {
    const org = await prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
    const locations = org.organizationId
      ? await prisma.facility.findMany({ where: { organizationId: org.organizationId }, select: { id: true, name: true } })
      : [];
    console.log('Org locations:', JSON.stringify(locations, null, 2));
    console.log('Trip fromLocationId matches org?', locations.some(l => l.id === trip.fromLocationId));
    console.log('Trip createdByUserId matches user?', trip.createdByUserId === userId);
  }

  const responses = await prisma.agencyResponse.findMany({
    where: { tripId }
  });
  console.log('Agency Responses:', JSON.stringify(responses, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
