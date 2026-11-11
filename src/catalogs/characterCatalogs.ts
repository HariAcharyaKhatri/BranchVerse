export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  traits: string[];
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Mythic';
}

/**
 * SPECIES & BLOODLINES (24+ diverse species)
 */
export const SPECIES_CATALOGUE: CatalogItem[] = [
  { id: 'human', name: 'Human', description: 'Versatile, adaptable, and ambitious mortals capable of rapid learning and innovation.', traits: ['Adaptable', 'High Learning Potential', 'Diplomatic'], rarity: 'Common' },
  { id: 'elf', name: 'Elf', description: 'Long-lived woodland beings attuned to natural mana, archery, and ancient traditions.', traits: ['Natural Mana Sensitivity', 'Agile', 'Keen Vision'], rarity: 'Common' },
  { id: 'high_elf', name: 'High Elf', description: 'Noble arcane lineage possessing vast mana reserves and millennium-old magical archives.', traits: ['Vast Mana Capacity', 'Arcane Mastery', 'Longevity'], rarity: 'Uncommon' },
  { id: 'dark_elf', name: 'Dark Elf', description: 'Subterranean dwellers attuned to shadow magic, subterranean stealth, and poison craft.', traits: ['Night Vision', 'Shadow Affinity', 'Poison Resistance'], rarity: 'Uncommon' },
  { id: 'dwarf', name: 'Dwarf', description: 'Resilient mountain artisans famed for master smithing, subterranean mining, and unyielding fortitude.', traits: ['Magic Resistance', 'Indomitable Constitution', 'Master Craftsman'], rarity: 'Common' },
  { id: 'beastkin', name: 'Beastkin', description: 'Humanoid warriors carrying the biological instincts, enhanced senses, and agility of beast lineages.', traits: ['Enhanced Senses', 'Predatory Reflexes', 'High Vitality'], rarity: 'Common' },
  { id: 'dragonkin', name: 'Dragonkin', description: 'Bearers of draconic bloodline boasting natural scale armor, heat immunity, and elemental breath.', traits: ['Draconic Scales', 'Thermal Immunity', 'Draconic Breath'], rarity: 'Rare' },
  { id: 'vampire', name: 'Vampire', description: 'Noble children of the night commanding blood arts, rapid regeneration, and aristocratic presence.', traits: ['Regeneration', 'Blood Magic Affinity', 'Hypnotic Presence'], rarity: 'Rare' },
  { id: 'werewolf', name: 'Werewolf', description: 'Primal shapeshifters capable of explosive kinetic force and pack coordination under lunar tides.', traits: ['Lycantropic Shift', 'Immense Strength', 'Regeneration'], rarity: 'Uncommon' },
  { id: 'demon', name: 'Demon', description: 'Born from infernal leylines, possessing hellfire manipulation, dark pacts, and charismatic deception.', traits: ['Hellfire Resistance', 'Demonic Constitution', 'Pact Weaving'], rarity: 'Rare' },
  { id: 'angel', name: 'Angel', description: 'Celestial messengers endowed with radiant holy halos, divine purification, and wings of starlight.', traits: ['Divine Grace', 'Holy Purification', 'Celestial Flight'], rarity: 'Very Rare' },
  { id: 'fallen_angel', name: 'Fallen Angel', description: 'Exiled celestials who combined forbidden abyssal truths with holy luminescence.', traits: ['Dual Light/Dark Resonance', 'Forbidden Insight', 'Indomitable Will'], rarity: 'Very Rare' },
  { id: 'fairy', name: 'Fairy', description: 'Diminutive, winged nature spirits capable of dream illusions, healing pollen, and spatial flight.', traits: ['Micro-Flight', 'Dream Illusions', 'Healing Spores'], rarity: 'Uncommon' },
  { id: 'spirit', name: 'Spirit / Elemental', description: 'Non-corporeal embodiments of pure elemental fire, water, wind, or earth mana.', traits: ['Physical Damage Immunity', 'Pure Elemental Affinity', 'Shape Alteration'], rarity: 'Rare' },
  { id: 'orc', name: 'Orc', description: 'Fierce honor-bound warriors boasting massive muscle density and unstoppable battle momentum.', traits: ['Berserk Fortitude', 'Overwhelming Strength', 'High Pain Tolerance'], rarity: 'Common' },
  { id: 'goblin', name: 'Goblin', description: 'Clever, resourceful survivalists skilled in scrap engineering, cunning traps, and ambush tactics.', traits: ['Nimble Dexterity', 'Scrap Invention', 'Pack Coordination'], rarity: 'Common' },
  { id: 'giant', name: 'Giant', description: 'Colossal beings of ancient stone and ice whose footfalls tremble mountain valleys.', traits: ['Colossal Might', 'Tectonic Stride', 'Physical Imperviousness'], rarity: 'Rare' },
  { id: 'merfolk', name: 'Merfolk', description: 'Aquatic humanoids dominating ocean depths, hydrothermal vents, and tidal hydrokinesis.', traits: ['Underwater Respiration', 'Fluid Hydro-Mastery', 'Acoustic Siren Song'], rarity: 'Uncommon' },
  { id: 'undead', name: 'Undead / Revenant', description: 'Souls bound to physical remnants, impervious to fatigue, poison, and biological decay.', traits: ['Fatigue Immunity', 'Pain Nullification', 'Cold Resistance'], rarity: 'Uncommon' },
  { id: 'lich', name: 'Lich', description: 'Transcendent undead sorcerers whose immortal essence is anchored within an arcane phylactery.', traits: ['Soul Phylactery', 'Infinite Arcane Lifespan', 'Necrotic Mastery'], rarity: 'Very Rare' },
  { id: 'homunculus', name: 'Homunculus', description: 'Artificially synthesized biological vessels engineered for flawless mana conduction.', traits: ['Pristine Mana Circuitry', 'No Biological Flaws', 'Chemical Adaptation'], rarity: 'Rare' },
  { id: 'golem', name: 'Golem', description: 'Sentient living stone or adamantine animated through runic consciousness cores.', traits: ['Physical Armor', 'Poison/Curse Immunity', 'Unwavering Stability'], rarity: 'Rare' },
  { id: 'slime', name: 'Slime', description: 'Amorphous polymorphic beings capable of absorbing matter, dissolving toxins, and reshaping mass.', traits: ['Physical Blunt Absorption', 'Dissolving Secretion', 'Morphing Anatomy'], rarity: 'Uncommon' },
];

/**
 * SOCIAL BACKGROUNDS
 */
export const SOCIAL_BACKGROUNDS: CatalogItem[] = [
  { id: 'commoner', name: 'Commoner / Free Citizen', description: 'Raised amidst ordinary town life, hardened by labor and practical grit.', traits: ['Practical Commonsense', 'Frugal', 'Approachable'] },
  { id: 'noble', name: 'Noble House', description: 'Educated in courtly etiquette, heraldry, fencing, and dynastic politics.', traits: ['Political Etiquette', 'Inherited Resources', 'Commanding Voice'] },
  { id: 'royal', name: 'Royal Lineage', description: 'Direct heir or prince/princess of a sovereign throne with ancient ancestral claims.', traits: ['Imperial Sovereign Aura', 'Vast Influence', 'Diplomatic Authority'] },
  { id: 'merchant_family', name: 'Merchant Dynasty', description: 'Groomed in ledger accounting, currency exchange, maritime shipping, and trade law.', traits: ['Financial Foresight', 'Negotiation Edge', 'Caravan Connections'] },
  { id: 'knight_family', name: 'Knightly Martial Clan', description: 'Disciplined under codes of chivalry, masterwork weapon maintenance, and siege doctrine.', traits: ['Martial Discipline', 'Oath Honor', 'Mounted Combat'] },
  { id: 'mage_family', name: 'Archmage Bloodline', description: 'Raised inside towers lined with esoteric grimoires, spell scrolls, and alchemy labs.', traits: ['Early Spell Awakening', 'Library Access', 'Rune Recognition'] },
  { id: 'scholar_family', name: 'Scholar & Academic Circle', description: 'Dedicated to historical inquiry, planar geography, lingual translation, and archaeology.', traits: ['Encyclopedic Knowledge', 'Ancient Tongue Deciphering', 'Analytical Logic'] },
  { id: 'religious_order', name: 'Sacred Monastery / Temple Order', description: 'Devoted to divine liturgical hymns, contemplative meditation, and holy vows.', traits: ['Curse Resistance', 'Devout Focus', 'Temple Hospitality'] },
  { id: 'adventurer', name: 'Veteran Adventurer Guild', description: 'Bred on wilderness campsites, dungeon mapping, foraging, and monster anatomy.', traits: ['Camp Survival', 'Danger Intuition', 'Dungeon Navigation'] },
  { id: 'orphan', name: 'Street Urchin / Orphan', description: 'Surviving through wit, alleyway shortcuts, picking locks, and dodging city guards.', traits: ['Street Smarts', 'Evasion', 'Keen Paranoia'] },
  { id: 'exile', name: 'Wandering Exile / Outcast', description: 'Cast out from a homeland, hardened by solitary wandering and foreign customs.', traits: ['Self-Reliance', 'Foreign Tongues', 'Unflinching Resolve'] },
  { id: 'farmer', name: 'Agrarian Farming Settlement', description: 'Rooted in the seasonal rhythms of fertile soil, harvesting crops, and tending livestock.', traits: ['Weather Intuition', 'Endurance', 'Animal Affinity'] },
  { id: 'craftsman', name: 'Artisan Guild Ward', description: 'Apprenticed to master builders, leatherworkers, stonemasons, and glassblowers.', traits: ['Material Appraisal', 'Tool Expertise', 'Patience'] },
  { id: 'political_family', name: 'Senate / Council Dynasty', description: 'Masters of clandestine treaties, legislative bribery, public rhetoric, and espionage.', traits: ['Subterfuge Awareness', 'Persuasive Speech', 'Spy Networks'] },
];

/**
 * PROFESSIONS AND CLASSES (Combat AND Non-Combat!)
 */
export const PROFESSIONS_CATALOGUE: CatalogItem[] = [
  // Combat Roles
  { id: 'prof_warrior', name: 'Warrior / Blademaster', description: 'Frontline vanguard skilled in weapons, footwork, and martial momentum.', traits: ['Weapon Mastery', 'Battle Stances', 'High Toughness'] },
  { id: 'prof_knight', name: 'Knight / Paladin', description: 'Mounted champion bound by chivalric oaths and heavy defensive armor.', traits: ['Heavy Armor Defense', 'Shield Bash', 'Inspiring Aura'] },
  { id: 'prof_mage', name: 'Mage / Elementalist', description: 'Spellcaster weaving ambient mana into destructive or protective magical arts.', traits: ['Incantation Speed', 'Elemental Versatility', 'Mana Control'] },
  { id: 'prof_healer', name: 'Healer / Cleric', description: 'Vitality practitioner dedicating life to restoring wounds, curing plagues, and saving lives.', traits: ['Wound Cleansing', 'Triage Instinct', 'Spiritual Comfort'] },
  { id: 'prof_archer', name: 'Ranger / Sharpshooter', description: 'Master of marksmanship, wilderness tracking, and perimeter scouting.', traits: ['Pinpoint Aim', 'Camouflage', 'Beast Tracking'] },
  { id: 'prof_assassin', name: 'Shadow Assassin / Infiltrator', description: 'Silent executioner striking from blind spots with fatal surgical precision.', traits: ['Silent Step', 'Concealed Blades', 'Anatomical Lethality'] },

  // Non-Combat & Production Roles
  { id: 'prof_merchant', name: 'Merchant / Trade Magnate', description: 'Economic powerhouse accumulating wealth, establishing trade routes, and managing cartels.', traits: ['Bargaining Edge', 'Supply Arbitrage', 'Contract Binding'] },
  { id: 'prof_farmer', name: 'Agronomist / Master Farmer', description: 'Cultivator of bountiful harvests, rare magical flora, and sustainable ecosystems.', traits: ['Crop Optimization', 'Soil Vitalization', 'Ecosystem Balance'] },
  { id: 'prof_blacksmith', name: 'Blacksmith / Weaponsmith', description: 'Master of the forge hammering ores into unbreakable weapons, armor, and implements.', traits: ['Metal Tempering', 'Anvil Mastery', 'Structural Diagnosis'] },
  { id: 'prof_alchemist', name: 'Alchemist / Apothecary', description: 'Transmuter of elements distilling volatile acids, restorative elixirs, and catalysts.', traits: ['Potion Compounding', 'Chemical Distillation', 'Herb Extracting'] },
  { id: 'prof_scholar', name: 'Scholar / Sage / Researcher', description: 'Academic investigator uncovering forgotten history, lost languages, and arcane laws.', traits: ['Rapid Archival Search', 'Riddle Solving', 'Planar Lore'] },
  { id: 'prof_engineer', name: 'Arcane Engineer / Mechanist', description: 'Inventor of clockwork automata, magitech conduits, airships, and defensive traps.', traits: ['Blueprint Drafting', 'Mechanism Assembly', 'Power Grid Tuning'] },
  { id: 'prof_architect', name: 'Architect / City Planner', description: 'Visionary master of stone fortifications, aqueducts, and magnificent palace design.', traits: ['Structural Integrity', 'Civic Logistics', 'Defensive Bastions'] },
  { id: 'prof_diplomat', name: 'Diplomat / Negotiator', description: 'Envoy de-escalating war, formulating royal treaties, and forging alliance accords.', traits: ['Conflict De-escalation', 'International Law', 'Silver Tongue'] },
  { id: 'prof_strategist', name: 'Grand Strategist / Tactician', description: 'Commander maneuvering armies, forecasting weather advantages, and outsmarting generals.', traits: ['Battlefield Geometry', 'Troop Morale', 'Predictive Logistics'] },
  { id: 'prof_administrator', name: 'Administrator / Governor', description: 'Civic leader organizing tax revenues, grain reserves, infrastructure, and peace.', traits: ['Treasury Management', 'Civic Order', 'Fair Justice'] },
  { id: 'prof_adventurer', name: 'Licensed Adventurer / Explorer', description: 'Jack of many frontier skills, mapping uncharted dungeons, ruins, and lost biomes.', traits: ['Survival Adaptation', 'Monster Lore', 'Cartography'] },
];

/**
 * DEFAULT BASE ATTRIBUTES
 */
export const DEFAULT_ATTRIBUTES = {
  strength: 15,
  agility: 15,
  vitality: 15,
  intelligence: 15,
  wisdom: 15,
  perception: 15,
  dexterity: 15,
  luck: 15,
  magicalControl: 15,
  magicalCapacity: 15,
  charisma: 15,
};
