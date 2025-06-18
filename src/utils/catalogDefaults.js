// src/utils/catalogDefaults.js

export const defaultCatalog = {
  conditioners: [
    { id: 'c1', name: 'EC5 Conditioner 75 (8x44)', price: 8000, type: 'EC5', category: 'conditioner', imageFilename: 'c1.jpg' },
    { id: 'c2', name: 'TCM Conditioner 75 (8x44)', price: 7000, type: 'TCM', category: 'conditioner', imageFilename: 'c2.jpg' },
    { id: 'c3', name: 'EC5 OxyTech (Well) 150 (10x54)', price: 6000, type: 'Oxytech', category: 'conditioner', imageFilename: 'c3.jpg' }
  ],
  filters: [
    { id: 'f1', name: 'QRS Carbon Wholehouse Filter (8x44)', price: 2200, packagePrice: 1400, category: 'filter', imageFilename: 'f1.jpg' },
    { id: 'f2', name: 'CleanStart (Laundry Station)', price: 3000, packagePrice: 1600, category: 'filter', imageFilename: 'f2.jpg' },
    { id: 'f3', name: 'AirMaster (Air Purifier)', price: 3000, packagePrice: 1600, category: 'filter', imageFilename: 'f3.jpg' }
  ],
  drinkingWater: [
    { id: 'd1', name: 'UltreFiner (RO)', price: 2400, packagePrice: 1595, category: 'drinking', imageFilename: 'd1.jpg' },
    { id: 'd2', name: 'Alkaline', price: 800, category: 'drinking', imageFilename: 'd2.jpg' }, // Assuming d2 has an image
    { id: 'd3', name: 'HydroFiner (Drinking water)', price: 1600, packagePrice: 900, category: 'drinking', imageFilename: 'd3.jpg' }
  ],
  upgrades: [
    // Upgrades might not have standard images, leave filename empty or use placeholder if needed
    { id: 'u1', name: 'Up size on softener to 150 (10x54) 1.5cf', price: 500, category: 'upgrade', imageFilename: '' }, 
    { id: 'u2', name: 'Up size on softener to 250 (13x54) 2.5cf', price: 1000, category: 'upgrade', imageFilename: '' },
    { id: 'u3', name: 'Up size on softener to 400 (16x65) 4.0cf', price: 1500, category: 'upgrade', imageFilename: '' }
  ],
  nonRainsoft: [
    { id: 'n1', name: 'Tankless RO', price: 1500, category: 'nonRainsoft', imageFilename: 'n1.jpg' }, // Assign appropriate filenames
    { id: 'n2', name: 'Regular RO 5-Stage', price: 1000, category: 'nonRainsoft', imageFilename: 'n2.jpg' },
    { id: 'n3', name: 'Regular RO 6-Stage', price: 1100, category: 'nonRainsoft', imageFilename: 'n3.jpg' },
    { id: 'n4', name: 'RO Pump', price: 500, packagePrice: 300, category: 'nonRainsoft', imageFilename: 'n4.jpg' },
    { id: 'n5', name: 'UV Light Viqua', price: 1600, category: 'nonRainsoft', imageFilename: 'n5.jpg' },
    { id: 'n6', name: 'Pressure Tank (Wellmate)', price: 1350, category: 'nonRainsoft', imageFilename: 'n6.jpg' },
    { id: 'n7', name: 'Pump Goulds 1.5hp (Well)', price: 1500, category: 'nonRainsoft', imageFilename: 'n7.jpg' }
  ],
  addons: [
    // Addons might not have images
    { id: 'addon1', name: 'Lifetime Soap Supply (5 Years Included)', price: 499, category: 'addon', subscriptionInfo: 'First 5 years included, $99/year after', imageFilename: '' },
    { id: 'addon2', name: 'Lifetime Soap Supply (10 Years Included)', price: 899, category: 'addon', subscriptionInfo: 'First 10 years included, $99/year after', imageFilename: '' },
    { id: 'addon3', name: 'Premium Salt Delivery Service', price: 299, category: 'addon', subscriptionInfo: 'First year included, $149/year after', imageFilename: '' },
    { id: 'addon4', name: 'Extended Water Quality Monitoring', price: 399, category: 'addon', subscriptionInfo: 'First 2 years included, $129/year after', imageFilename: '' }
  ]
};

export const defaultPackages = [
  { id: 'pkg1', name: 'Premium Package (EC5, QRS, RO, Alkaline, AirMaster, CleanStart)', items: ['c1', 'f1', 'd1', 'd2', 'f3', 'f2'], individualPrice: 19400, packagePrice: 14995 },
  { id: 'pkg2', name: 'Premium Basic City Package (EC5, QRS, RO)', items: ['c1', 'f1', 'd1'], individualPrice: 12600, packagePrice: 10995 },
  { id: 'pkg3', name: 'Premium Well Package (EC5, Oxy, UV, RO, Alkaline, AirMaster, CleanStart)', items: ['c1', 'c3', 'n5', 'd1', 'd2', 'f3', 'f2'], individualPrice: 25300, packagePrice: 21695 },
  { id: 'pkg4', name: 'Premium Well with Pump & Pressure Tank', items: ['c1', 'c3', 'n5', 'd1', 'd2', 'f3', 'f2', 'n6', 'n7'], individualPrice: 28300, packagePrice: 24695 },
  { id: 'pkg5', name: 'Premium Basic Well (EC5-150, Oxy, UV, RO)', items: ['c1', 'c3', 'n5', 'd1'], individualPrice: 18000, packagePrice: 17695 }
];

export const financingOptions = [
  { id: 'fin1', name: 'Home Depot Credit Card', interestRate: 0, terms: [24], description: 'No Interest if Paid in Full within 24 Months' },
  { id: 'fin2', name: 'ISPC', interestRate: 9.9, terms: [0], description: 'Revolving Charge Account - 1% Payment Factor' },
  { id: 'fin3', name: 'Goodleap', interestRate: 10.9, terms: [180], description: '15 Year Term Length' },
  { id: 'fin4', name: 'YGrene', interestRate: 8.9, terms: [120, 180, 240, 300], description: '10-15-20-25 Year Term Length' }
];