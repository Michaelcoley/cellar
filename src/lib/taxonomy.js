// Spirit taxonomy. The shape collectors expect, not a generic "Type" dropdown.

export const CATEGORIES = {
  whiskey: {
    label: 'Whiskey',
    subtypes: [
      'Bourbon',
      'Rye',
      'Tennessee',
      'Single Malt Scotch',
      'Blended Scotch',
      'Irish',
      'Japanese',
      'American Single Malt',
      'Canadian',
      'World Whisky',
    ],
  },
  tequila: {
    label: 'Tequila',
    subtypes: ['Blanco', 'Reposado', 'Añejo', 'Extra Añejo', 'Cristalino'],
  },
  mezcal: {
    label: 'Mezcal',
    subtypes: ['Joven', 'Reposado', 'Añejo', 'Ensamble'],
  },
  rum: {
    label: 'Rum',
    subtypes: ['White', 'Gold', 'Dark', 'Aged', 'Spiced', 'Agricole', 'Overproof'],
  },
  gin: {
    label: 'Gin',
    subtypes: ['London Dry', 'Old Tom', 'Plymouth', 'Navy Strength', 'Contemporary', 'Genever'],
  },
  vodka: {
    label: 'Vodka',
    subtypes: ['Grain', 'Potato', 'Wheat', 'Rye', 'Flavored'],
  },
  cognac: {
    label: 'Cognac & Brandy',
    subtypes: ['VS', 'VSOP', 'XO', 'Hors d’Âge', 'Armagnac', 'Calvados', 'Pisco', 'American Brandy'],
  },
  liqueur: {
    label: 'Liqueur',
    subtypes: ['Amaro', 'Herbal', 'Fruit', 'Cream', 'Coffee', 'Nut', 'Anise'],
  },
  vermouth: {
    label: 'Vermouth & Aperitif',
    subtypes: ['Dry', 'Sweet', 'Bianco', 'Rosé', 'Aperitivo'],
  },
  other: {
    label: 'Other',
    subtypes: ['Absinthe', 'Aquavit', 'Baijiu', 'Soju', 'Shochu', 'Cachaça', 'Eau de Vie'],
  },
};

export const STATUSES = ['sealed', 'opened', 'in_use', 'finished'];

export const STATUS_LABEL = {
  sealed: 'Sealed',
  opened: 'Opened',
  in_use: 'In use',
  finished: 'Finished',
};

export const COLOR_SWATCHES = [
  { name: 'Pale Straw', hex: '#F5E6A8' },
  { name: 'Straw', hex: '#EFD27A' },
  { name: 'Pale Gold', hex: '#E8C067' },
  { name: 'Gold', hex: '#D9A441' },
  { name: 'Old Gold', hex: '#B98232' },
  { name: 'Amber', hex: '#A0631F' },
  { name: 'Deep Copper', hex: '#7B3F12' },
  { name: 'Mahogany', hex: '#5A2A0E' },
];

export const TASTING_CHIPS = {
  nose: ['Vanilla', 'Caramel', 'Honey', 'Oak', 'Smoke', 'Peat', 'Citrus', 'Apple', 'Cherry', 'Tobacco', 'Leather', 'Spice', 'Floral', 'Chocolate'],
  palate: ['Sweet', 'Dry', 'Bitter', 'Spicy', 'Fruity', 'Smoky', 'Nutty', 'Buttery', 'Creamy', 'Earthy', 'Minty', 'Peppery'],
  finish: ['Short', 'Medium', 'Long', 'Lingering', 'Warm', 'Cool', 'Drying', 'Sweet', 'Spicy', 'Smoky'],
};

export function categoryLabel(key) {
  return CATEGORIES[key]?.label ?? 'Other';
}

export function defaultPourOz() {
  return 1.5;
}

// Lifecycle warning thresholds in days
export const FRESHNESS = {
  gin: 180,
  vodka: 365,
  vermouth: 30,
  liqueur: 365,
  whiskey: 730,
  bourbon: 730,
  rum: 730,
  tequila: 365,
  default: 365,
};

export function freshnessThresholdDays(category) {
  return FRESHNESS[category] ?? FRESHNESS.default;
}
