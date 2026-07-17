/**
 * Taux réels d'octroi de mer et TVA par territoire français d'outre-mer
 * Source: Direction Générale des Douanes et Droits Indirects (2026)
 * Mise à jour: Juillet 2025 - Alignement CTM sur Guadeloupe
 */

export type Territory = 'martinique' | 'guadeloupe' | 'guyane' | 'reunion' | 'mayotte';

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  om_rate: number; // Octroi de mer en %
  tva_rate: number; // TVA en %
}

export interface TerritoryRates {
  territory: Territory;
  name: string;
  flag: string;
  port: string;
  avg_shipping_days: number;
  categories: ProductCategory[];
}

// Catégories de produits avec leurs taux par défaut
export const PRODUCT_CATEGORIES: Record<string, ProductCategory> = {
  // === 0% Octroi de mer (exonérés) ===
  medical: {
    id: 'medical',
    name: 'Équipement médical/pharmaceutique',
    description: 'Matériel médical, médicaments, équipements de santé',
    om_rate: 0,
    tva_rate: 0.085,
  },
  solaire: {
    id: 'solaire',
    name: 'Panneaux solaires & énergie renouvelable',
    description: 'Panneaux solaires, éoliennes, matériel renewable energy',
    om_rate: 0,
    tva_rate: 0,
  },
  livre_presse: {
    id: 'livre_presse',
    name: 'Livres & presse',
    description: 'Livres, journaux, revues, matériel éducatif',
    om_rate: 0,
    tva_rate: 0.055,
  },

  // === 2-5% Octroi de mer ===
  textile: {
    id: 'textile',
    name: 'Vêtements & textile',
    description: 'Vêtements, chaussures, tissus, accessoires mode',
    om_rate: 0.02,
    tva_rate: 0.085,
  },
  deco_petits: {
    id: 'deco_petits',
    name: 'Petits articles de décoration',
    description: 'Décoration, ustensiles, petits objets, cadeaux',
    om_rate: 0.05,
    tva_rate: 0.085,
  },

  // === 7-10% Octroi de mer ===
  meubles: {
    id: 'meubles',
    name: 'Meubles & mobilier',
    description: 'Meubles, canapés, lits, tables, chaises',
    om_rate: 0.07,
    tva_rate: 0.085,
  },
  electromenager: {
    id: 'electromenager',
    name: 'Électroménager',
    description: 'Réfrigérateur, lave-linge, lave-vaisselle, cuisinières',
    om_rate: 0.10,
    tva_rate: 0.085,
  },
  equipement_resto: {
    id: 'equipement_resto',
    name: 'Équipement restaurant/cuisine',
    description: 'Fourneaux, friteuses, machines à glaçons, matériel pro',
    om_rate: 0.07,
    tva_rate: 0.085,
  },
  tente_marquee: {
    id: 'tente_marquee',
    name: 'Tentes & marquees',
    description: 'Tentes, marquees, structures événementiel',
    om_rate: 0.10,
    tva_rate: 0.085,
  },
  materiel_construction: {
    id: 'materiel_construction',
    name: 'Matériel de construction (hors acier)',
    description: 'Outils, équipement BTP, matériel construction léger',
    om_rate: 0.07,
    tva_rate: 0.085,
  },

  // === 10-15% Octroi de mer ===
  electronique: {
    id: 'electronique',
    name: 'Électronique & informatique',
    description: 'Téléphones, ordinateurs, écrans, caméras, drones',
    om_rate: 0.15,
    tva_rate: 0.085,
  },
  sacs_luxe: {
    id: 'sacs_luxe',
    name: 'Maroquinerie & sacs',
    description: 'Sacs à main, portefeuilles, articles en cuir',
    om_rate: 0.10,
    tva_rate: 0.085,
  },
  bijoux: {
    id: 'bijoux',
    name: 'Bijoux & accessoires',
    description: 'Bijoux, montres, accessoires de mode premium',
    om_rate: 0.10,
    tva_rate: 0.085,
  },
  vehicules_pieces: {
    id: 'vehicules_pieces',
    name: 'Pièces automobiles & accessoires',
    description: 'Pièces voitures, motos, accessoires auto',
    om_rate: 0.07,
    tva_rate: 0.085,
  },
  outils_machines: {
    id: 'outils_machines',
    name: 'Outils & machines industrielles',
    description: 'Soudeuses, compresseurs, perceuses, équipement pro lourd',
    om_rate: 0.07,
    tva_rate: 0.085,
  },
  fitness: {
    id: 'fitness',
    name: 'Équipement fitness & sport',
    description: 'Haltères, machines fitness, équipement sportif',
    om_rate: 0.05,
    tva_rate: 0.085,
  },
  vetement_polo: {
    id: 'vetement_polo',
    name: 'Vêtements (tailles/marques)',
    description: 'Polo, t-shirts, vêtements en vrac',
    om_rate: 0.02,
    tva_rate: 0.085,
  },

  // === Spécial: Boissons & produits restreints ===
  alcool: {
    id: 'alcool',
    name: '🚫 ALCOOL/VIN (très taxé)',
    description: 'Vins, alcools forts - taux très élevé, déconseillé',
    om_rate: 0.40,
    tva_rate: 0.085,
  },
  tabac: {
    id: 'tabac',
    name: '🚫 TABAC/CIGARETTES (très taxé)',
    description: 'Cigarettes, tabac - taux prohibitif',
    om_rate: 0.50,
    tva_rate: 0.085,
  },
};

// Taux spécifiques par territoire
export const TERRITORIES: Record<Territory, TerritoryRates> = {
  martinique: {
    territory: 'martinique',
    name: 'Martinique 🇲🇶',
    flag: '🇲🇶',
    port: 'Fort-de-France',
    avg_shipping_days: 18,
    categories: Object.values(PRODUCT_CATEGORIES),
  },
  guadeloupe: {
    territory: 'guadeloupe',
    name: 'Guadeloupe 🇬🇵',
    flag: '🇬🇵',
    port: 'Pointe-à-Pitre',
    avg_shipping_days: 18,
    categories: Object.values(PRODUCT_CATEGORIES),
  },
  guyane: {
    territory: 'guyane',
    name: 'Guyane française 🇬🇫',
    flag: '🇬🇫',
    port: 'Cayenne',
    avg_shipping_days: 21,
    categories: Object.values(PRODUCT_CATEGORIES),
  },
  reunion: {
    territory: 'reunion',
    name: 'Réunion 🇷🇪',
    flag: '🇷🇪',
    port: 'Port-est (Le Port)',
    avg_shipping_days: 35,
    categories: Object.values(PRODUCT_CATEGORIES),
  },
  mayotte: {
    territory: 'mayotte',
    name: 'Mayotte 🇾🇹',
    flag: '🇾🇹',
    port: 'Dzaoudzi',
    avg_shipping_days: 32,
    categories: Object.values(PRODUCT_CATEGORIES),
  },
};

/**
 * Calcule les taxes pour une marchandise
 */
export interface CalculationInput {
  territory: Territory;
  category_id: string;
  fob_value: number; // Valeur FOB en €
  weight?: number; // kg (optionnel, pour infos)
  cbm?: number; // CBM (optionnel, pour infos)
  freight_cost?: number; // Fret proposé (optionnel, sinon calcul standard)
  insurance_percent?: number; // % d'assurance (défaut: 1%)
}

export interface CalculationResult {
  territory: Territory;
  category: ProductCategory;
  fob_value: number;
  freight_cost: number;
  insurance_cost: number;
  cif_value: number; // FOB + Fret + Assurance
  octroi_de_mer: number;
  tva: number;
  total_taxes: number;
  total_delivered_price: number; // CIF + Taxes
  shipping_days: number;
  summary: string;
}

export function calculate(input: CalculationInput): CalculationResult {
  const territory = TERRITORIES[input.territory];
  if (!territory) throw new Error(`Territoire invalide: ${input.territory}`);

  const category = PRODUCT_CATEGORIES[input.category_id];
  if (!category) throw new Error(`Catégorie invalide: ${input.category_id}`);

  // 1. Fret (par défaut: fret maritime standard estimé)
  const freight = input.freight_cost ?? estimateFreight(input.cbm, input.weight);

  // 2. Assurance (par défaut: 1% de la valeur FOB)
  const insurance_rate = input.insurance_percent ?? 1;
  const insurance = (input.fob_value * insurance_rate) / 100;

  // 3. CIF = FOB + Fret + Assurance
  const cif = input.fob_value + freight + insurance;

  // 4. Octroi de mer = CIF × taux
  const om = cif * category.om_rate;

  // 5. TVA = (CIF + Octroi de mer) × taux TVA
  const tva = (cif + om) * category.tva_rate;

  // 6. Total taxes
  const total_taxes = om + tva;

  // 7. Prix final livré
  const total_delivered = cif + total_taxes;

  return {
    territory: input.territory,
    category,
    fob_value: input.fob_value,
    freight_cost: freight,
    insurance_cost: insurance,
    cif_value: cif,
    octroi_de_mer: om,
    tva,
    total_taxes,
    total_delivered_price: total_delivered,
    shipping_days: territory.avg_shipping_days,
    summary: `${category.name} | CIF: ${cif.toFixed(2)}€ | Taxes: ${total_taxes.toFixed(2)}€ | Livré: ${total_delivered.toFixed(2)}€`,
  };
}

/**
 * Estime le fret maritime basé sur CBM ou poids
 */
function estimateFreight(cbm?: number, weight?: number): number {
  // Tarif standard LCL: 380€/CBM
  if (cbm) return cbm * 380;

  // Si pas de CBM, estimer à partir du poids (densité 100kg/CBM)
  if (weight) {
    const estimated_cbm = weight / 100;
    return estimated_cbm * 380;
  }

  // Défaut: fret minimum
  return 200;
}

/**
 * Format la devise
 */
export function formatPrice(value: number): string {
  return `${value.toFixed(2)}€`;
}

export function formatPriceFull(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}
