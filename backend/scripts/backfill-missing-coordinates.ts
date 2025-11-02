/**
 * Backfill Missing Coordinates Script
 * Geocodes existing healthcare locations, agencies, and destinations that are missing coordinates
 */

import { PrismaClient } from '@prisma/client';
import { GeocodingService } from '../src/utils/geocodingService';

const prisma = new PrismaClient();

async function backfillCoordinates() {
  console.log('🗺️  Starting coordinate backfill process...\n');

  try {
    // 1. Backfill healthcare locations
    console.log('📍 Processing healthcare locations...');
    const locationsWithoutCoords = await prisma.healthcareLocation.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ],
        isActive: true
      }
    });

    console.log(`Found ${locationsWithoutCoords.length} locations without coordinates`);

    for (const location of locationsWithoutCoords) {
      console.log(`  Processing: ${location.locationName}`);
      const result = await GeocodingService.geocodeAddress(
        location.address,
        location.city,
        location.state,
        location.zipCode,
        location.locationName
      );

      if (result.success && result.latitude && result.longitude) {
        await prisma.healthcareLocation.update({
          where: { id: location.id },
          data: {
            latitude: result.latitude,
            longitude: result.longitude
          }
        });
        console.log(`    ✅ Geocoded: ${result.latitude}, ${result.longitude}`);
      } else {
        console.log(`    ❌ Failed: ${result.error}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🚑 Processing EMS agencies...');
    const agenciesWithoutCoords = await prisma.eMSAgency.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ],
        isActive: true
      }
    });

    console.log(`Found ${agenciesWithoutCoords.length} agencies without coordinates`);

    for (const agency of agenciesWithoutCoords) {
      console.log(`  Processing: ${agency.name}`);
      const result = await GeocodingService.geocodeAddress(
        agency.address,
        agency.city,
        agency.state,
        agency.zipCode,
        agency.name
      );

      if (result.success && result.latitude && result.longitude) {
        await prisma.eMSAgency.update({
          where: { id: agency.id },
          data: {
            latitude: result.latitude,
            longitude: result.longitude
          }
        });
        console.log(`    ✅ Geocoded: ${result.latitude}, ${result.longitude}`);
      } else {
        console.log(`    ❌ Failed: ${result.error}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎯 Processing healthcare destinations...');
    const destinationsWithoutCoords = await prisma.healthcareDestination.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ],
        isActive: true
      }
    });

    console.log(`Found ${destinationsWithoutCoords.length} destinations without coordinates`);

    for (const destination of destinationsWithoutCoords) {
      console.log(`  Processing: ${destination.name}`);
      const result = await GeocodingService.geocodeAddress(
        destination.address,
        destination.city,
        destination.state,
        destination.zipCode,
        destination.name
      );

      if (result.success && result.latitude && result.longitude) {
        await prisma.healthcareDestination.update({
          where: { id: destination.id },
          data: {
            latitude: result.latitude,
            longitude: result.longitude
          }
        });
        console.log(`    ✅ Geocoded: ${result.latitude}, ${result.longitude}`);
      } else {
        console.log(`    ❌ Failed: ${result.error}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Coordinate backfill complete!');

  } catch (error) {
    console.error('❌ Error during backfill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backfillCoordinates();

