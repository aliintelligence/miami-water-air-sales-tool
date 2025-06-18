require('dotenv').config();
const mongoose = require('mongoose');
const { Equipment, Package, FinancingOption } = require('../server/models');
const { 
  defaultCatalog, 
  defaultPackages, 
  financingOptions: defaultFinancingOptions 
} = require('../src/utils/catalogDefaults');

async function migrateToMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/miamiwaterair');
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    await Equipment.deleteMany({});
    await Package.deleteMany({});
    await FinancingOption.deleteMany({});
    console.log('Cleared existing data');

    // Migrate Equipment
    console.log('\nMigrating Equipment...');
    for (const [categoryKey, items] of Object.entries(defaultCatalog)) {
      for (const [index, item] of items.entries()) {
        const equipment = new Equipment({
          ...item,
          categoryKey,
          sortOrder: index,
          isActive: true
        });
        await equipment.save();
        console.log(`✓ Created equipment: ${item.name}`);
      }
    }

    // Migrate Packages
    console.log('\nMigrating Packages...');
    for (const [index, pkg] of defaultPackages.entries()) {
      const package = new Package({
        ...pkg,
        sortOrder: index,
        isActive: true
      });
      await package.save();
      console.log(`✓ Created package: ${pkg.name}`);
    }

    // Migrate Financing Options
    console.log('\nMigrating Financing Options...');
    for (const [index, option] of defaultFinancingOptions.entries()) {
      const financingOption = new FinancingOption({
        ...option,
        sortOrder: index,
        isActive: true
      });
      await financingOption.save();
      console.log(`✓ Created financing option: ${option.name}`);
    }

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateToMongoDB();