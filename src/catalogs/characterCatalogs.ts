export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  traits: string[];
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Mythic';
  iconPath?: string;
  portraitPath?: string;
}

/**
 * SPECIES & BLOODLINES (24+ diverse species with associated portrait & crest paths)
 */
export const SPECIES_CATALOGUE: CatalogItem[] = [
  { id: 'human', name: 'Human', description: 'Versatile, adaptable, and ambitious mortals capable of rapid learning and innovation.', traits: ['Adaptable', 'High Learning Potential', 'Diplomatic'], rarity: 'Common', portraitPath: '/assets/characters/human/human-male-portrait.png', iconPath: '/assets/characters/human/human-crest.svg' },
  { id: 'elf', name: 'Elf', description: 'Long-lived woodland beings attuned to natural mana, archery, and ancient traditions.', traits: ['Natural Mana Sensitivity', 'Agile', 'Keen Vision'], rarity: 'Common', portraitPath: '/assets/characters/elf/elf-female-portrait.png', iconPath: '/assets/characters/elf/elf-crest.svg' },
  { id: 'high_elf', name: 'High Elf', description: 'Noble arcane lineage possessing vast mana reserves and millennium-old magical archives.', traits: ['Vast Mana Capacity', 'Arcane Mastery', 'Longevity'], rarity: 'Uncommon', portraitPath: '/assets/characters/elf/elf-male-portrait.png', iconPath: '/assets/characters/elf/high-elf-crest.svg' },
  { id: 'dark_elf', name: 'Dark Elf', description: 'Subterranean dwellers attuned to shadow magic, subterranean stealth, and poison craft.', traits: ['Night Vision', 'Shadow Affinity', 'Poison Resistance'], rarity: 'Uncommon', portraitPath: '/assets/characters/elf/elf-female-portrait.png', iconPath: '/assets/characters/elf/dark-elf-crest.svg' },
  { id: 'dwarf', name: 'Dwarf', description: 'Resilient mountain artisans famed for master smithing, subterranean mining, and unyielding fortitude.', traits: ['Magic Resistance', 'Indomitable Constitution', 'Master Craftsman'], rarity: 'Common', portraitPath: '/assets/characters/dwarf/dwarf-male-portrait.png', iconPath: '/assets/characters/dwarf/dwarf-crest.svg' },
  { id: 'beastkin', name: 'Beastkin', description: 'Humanoid warriors carrying the biological instincts, enhanced senses, and agility of beast lineages.', traits: ['Enhanced Senses', 'Predatory Reflexes', 'High Vitality'], rarity: 'Common', iconPath: '/assets/characters/beastfolk/wolfkin-crest.svg' },
  { id: 'dragonkin', name: 'Dragonkin', description: 'Bearers of draconic bloodline boasting natural scale armor, heat immunity, and elemental breath.', traits: ['Draconic Scales', 'Thermal Immunity', 'Draconic Breath'], rarity: 'Rare', iconPath: '/assets/characters/dragonborn/dragonborn-crest.svg' },
  { id: 'vampire', name: 'Vampire', description: 'Noble children of the night commanding blood arts, rapid regeneration, and aristocratic presence.', traits: ['Regeneration', 'Blood Magic Affinity', 'Hypnotic Presence'], rarity: 'Rare', iconPath: '/assets/characters/undead/vampire-crest.svg' },
  { id: 'werewolf', name: 'Werewolf', description: 'Primal shapeshifters capable of explosive kinetic force and pack coordination under lunar tides.', traits: ['Lycantropic Shift', 'Immense Strength', 'Regeneration'], rarity: 'Uncommon', iconPath: '/assets/characters/beastfolk/werewolf-crest.svg' },
  { id: 'demon', name: 'Demon', description: 'Born from infernal leylines, possessing hellfire manipulation, dark pacts, and charismatic deception.', traits: ['Hellfire Resistance', 'Demonic Constitution', 'Pact Weaving'], rarity: 'Rare', iconPath: '/assets/characters/demon/demon-crest.svg' },
  { id: 'angel', name: 'Angel', description: 'Celestial messengers endowed with radiant holy halos, divine purification, and wings of starlight.', traits: ['Divine Grace', 'Holy Purification', 'Celestial Flight'], rarity: 'Very Rare', portraitPath: '/assets/characters/angel/celestial-seraphina-angel.svg', iconPath: '/assets/characters/angel/angel-crest.svg' },
  { id: 'fallen_angel', name: 'Fallen Angel', description: 'Exiled celestials who combined forbidden abyssal truths with holy luminescence.', traits: ['Dual Light/Dark Resonance', 'Forbidden Insight', 'Indomitable Will'], rarity: 'Very Rare', iconPath: '/assets/characters/angel/fallen-angel-crest.svg' },
  { id: 'fairy', name: 'Fairy', description: 'Diminutive, winged nature spirits capable of dream illusions, healing pollen, and spatial flight.', traits: ['Micro-Flight', 'Dream Illusions', 'Healing Spores'], rarity: 'Uncommon', iconPath: '/assets/characters/other/fairy-crest.svg' },
  { id: 'spirit', name: 'Spirit / Elemental', description: 'Non-corporeal embodiments of pure elemental fire, water, wind, or earth mana.', traits: ['Physical Damage Immunity', 'Pure Elemental Affinity', 'Shape Alteration'], rarity: 'Rare', portraitPath: '/assets/creatures/monsters/fire-elemental.svg', iconPath: '/assets/characters/other/spirit-crest.svg' },
  { id: 'orc', name: 'Orc', description: 'Fierce honor-bound warriors boasting massive muscle density and unstoppable battle momentum.', traits: ['Berserk Fortitude', 'Overwhelming Strength', 'High Pain Tolerance'], rarity: 'Common', portraitPath: '/assets/characters/orc/orc-warrior-portrait.png', iconPath: '/assets/characters/orc/orc-crest.svg' },
  { id: 'goblin', name: 'Goblin', description: 'Clever, resourceful survivalists skilled in scrap engineering, cunning traps, and ambush tactics.', traits: ['Nimble Dexterity', 'Scrap Invention', 'Pack Coordination'], rarity: 'Common', iconPath: '/assets/characters/other/goblin-crest.svg' },
  { id: 'giant', name: 'Giant', description: 'Colossal beings of ancient stone and ice whose footfalls tremble mountain valleys.', traits: ['Colossal Might', 'Tectonic Stride', 'Physical Imperviousness'], rarity: 'Rare', iconPath: '/assets/characters/other/giant-crest.svg' },
  { id: 'merfolk', name: 'Merfolk', description: 'Aquatic humanoids dominating ocean depths, hydrothermal vents, and tidal hydrokinesis.', traits: ['Underwater Respiration', 'Fluid Hydro-Mastery', 'Acoustic Siren Song'], rarity: 'Uncommon', iconPath: '/assets/characters/other/mermaid-crest.svg' },
  { id: 'undead', name: 'Undead / Revenant', description: 'Souls bound to physical remnants, impervious to fatigue, poison, and biological decay.', traits: ['Fatigue Immunity', 'Pain Nullification', 'Cold Resistance'], rarity: 'Uncommon', iconPath: '/assets/characters/undead/skeleton-crest.svg' },
  { id: 'lich', name: 'Lich', description: 'Transcendent undead sorcerers whose immortal essence is anchored within an arcane phylactery.', traits: ['Soul Phylactery', 'Infinite Arcane Lifespan', 'Necrotic Mastery'], rarity: 'Very Rare', iconPath: '/assets/creatures/undead/lich.svg' },
  { id: 'homunculus', name: 'Homunculus', description: 'Artificially synthesized biological vessels engineered for flawless mana conduction.', traits: ['Pristine Mana Circuitry', 'No Biological Flaws', 'Chemical Adaptation'], rarity: 'Rare', iconPath: '/assets/characters/other/golem-crest.svg' },
  { id: 'golem', name: 'Golem', description: 'Sentient living stone or adamantine animated through runic consciousness cores.', traits: ['Physical Armor', 'Poison/Curse Immunity', 'Unwavering Stability'], rarity: 'Rare', iconPath: '/assets/characters/other/golem-crest.svg' },
  { id: 'slime', name: 'Slime', description: 'Amorphous polymorphic beings capable of absorbing matter, dissolving toxins, and reshaping mass.', traits: ['Physical Blunt Absorption', 'Dissolving Secretion', 'Morphing Anatomy'], rarity: 'Uncommon', iconPath: '/assets/characters/other/slime-crest.svg' },
];

/**
 * SOCIAL BACKGROUNDS
 */
export const SOCIAL_BACKGROUNDS: CatalogItem[] = [
  { id: 'commoner', name: 'Commoner / Free Citizen', description: 'Raised amidst ordinary town life, hardened by labor and practical grit.', traits: ['Practical Commonsense', 'Frugal', 'Approachable'], iconPath: '/assets/characters/human/human-crest.svg' },
  { id: 'noble', name: 'Noble House', description: 'Educated in courtly etiquette, heraldry, fencing, and dynastic politics.', traits: ['Political Etiquette', 'Inherited Resources', 'Commanding Voice'], iconPath: '/assets/characters/elf/high-elf-crest.svg' },
  { id: 'royal', name: 'Royal Lineage', description: 'Direct heir or prince/princess of a sovereign throne with ancient ancestral claims.', traits: ['Imperial Sovereign Aura', 'Vast Influence', 'Diplomatic Authority'], iconPath: '/assets/icons/item-gem.svg' },
  { id: 'merchant_family', name: 'Merchant Dynasty', description: 'Groomed in ledger accounting, currency exchange, maritime shipping, and trade law.', traits: ['Financial Foresight', 'Negotiation Edge', 'Caravan Connections'], iconPath: '/assets/professions/non-combat/merchant.svg' },
  { id: 'knight_family', name: 'Knightly Martial Clan', description: 'Disciplined under codes of chivalry, masterwork weapon maintenance, and siege doctrine.', traits: ['Martial Discipline', 'Oath Honor', 'Mounted Combat'], iconPath: '/assets/professions/combat/knight.svg' },
  { id: 'mage_family', name: 'Archmage Bloodline', description: 'Raised inside towers lined with esoteric grimoires, spell scrolls, and alchemy labs.', traits: ['Early Spell Awakening', 'Library Access', 'Rune Recognition'], iconPath: '/assets/professions/combat/archmage.svg' },
  { id: 'scholar_family', name: 'Scholar & Academic Circle', description: 'Dedicated to historical inquiry, planar geography, lingual translation, and archaeology.', traits: ['Encyclopedic Knowledge', 'Ancient Tongue Deciphering', 'Analytical Logic'], iconPath: '/assets/professions/non-combat/scholar.svg' },
  { id: 'religious_order', name: 'Sacred Monastery / Temple Order', description: 'Devoted to divine liturgical hymns, contemplative meditation, and holy vows.', traits: ['Curse Resistance', 'Devout Focus', 'Temple Hospitality'], iconPath: '/assets/powers/divine/holy-magic.svg' },
  { id: 'adventurer', name: 'Veteran Adventurer Guild', description: 'Bred on wilderness campsites, dungeon mapping, foraging, and monster anatomy.', traits: ['Camp Survival', 'Danger Intuition', 'Dungeon Navigation'], iconPath: '/assets/professions/non-combat/explorer.svg' },
  { id: 'orphan', name: 'Street Urchin / Orphan', description: 'Surviving through wit, alleyway shortcuts, picking locks, and dodging city guards.', traits: ['Street Smarts', 'Evasion', 'Keen Paranoia'], iconPath: '/assets/professions/combat/rogue.svg' },
  { id: 'exile', name: 'Wandering Exile / Outcast', description: 'Cast out from a homeland, hardened by solitary wandering and foreign customs.', traits: ['Self-Reliance', 'Foreign Tongues', 'Unflinching Resolve'], iconPath: '/assets/icons/ui-map.svg' },
  { id: 'farmer', name: 'Agrarian Farming Settlement', description: 'Rooted in the seasonal rhythms of fertile soil, harvesting crops, and tending livestock.', traits: ['Weather Intuition', 'Endurance', 'Animal Affinity'], iconPath: '/assets/professions/non-combat/farmer.svg' },
  { id: 'craftsman', name: 'Artisan Guild Ward', description: 'Apprenticed to master builders, leatherworkers, stonemasons, and glassblowers.', traits: ['Material Appraisal', 'Tool Expertise', 'Patience'], iconPath: '/assets/professions/non-combat/craftsman.svg' },
  { id: 'political_family', name: 'Senate / Council Dynasty', description: 'Masters of clandestine treaties, legislative bribery, public rhetoric, and espionage.', traits: ['Subterfuge Awareness', 'Persuasive Speech', 'Spy Networks'], iconPath: '/assets/professions/non-combat/diplomat.svg' },
];

/**
 * PROFESSIONS AND CLASSES (Combat AND Non-Combat!)
 */
export const PROFESSIONS_CATALOGUE: CatalogItem[] = [
  // Combat & Martial Roles
  { id: 'prof_warrior', name: 'Warrior / Blademaster', description: 'Frontline vanguard skilled in weapons, footwork, and martial momentum.', traits: ['Weapon Mastery', 'Battle Stances', 'High Toughness'], iconPath: '/assets/professions/combat/warrior.svg' },
  { id: 'prof_knight', name: 'Knight / Paladin', description: 'Mounted champion bound by chivalric oaths and heavy defensive armor.', traits: ['Heavy Armor Defense', 'Shield Bash', 'Inspiring Aura'], iconPath: '/assets/professions/combat/knight.svg' },
  { id: 'prof_swordsman', name: 'Swordsman / Spellblade', description: 'Adept duelist weaving kinetic sword slashes with concentrated elemental spell blades.', traits: ['Quickdraw Stance', 'Mana Edge', 'Acrobatic Parrying'], iconPath: '/assets/professions/combat/swordsman.svg' },
  { id: 'prof_mage', name: 'Mage / Elementalist', description: 'Spellcaster weaving ambient mana into destructive or protective magical arts.', traits: ['Incantation Speed', 'Elemental Versatility', 'Mana Control'], portraitPath: '/assets/professions/combat/fire-mage-male.svg', iconPath: '/assets/professions/combat/mage.svg' },
  { id: 'prof_archmage', name: 'Archmage / Arcanist', description: 'Master of forbidden grimoires, multi-tier casting, and reality-bending Leyline circles.', traits: ['Multi-Cast Spell Matrix', 'Overchanneling', 'Planar Sight'], iconPath: '/assets/professions/combat/archmage.svg' },
  { id: 'prof_healer', name: 'Healer / Cleric', description: 'Vitality practitioner dedicating life to restoring wounds, curing plagues, and saving lives.', traits: ['Wound Cleansing', 'Triage Instinct', 'Spiritual Comfort'], portraitPath: '/assets/professions/combat/cleric-female.svg', iconPath: '/assets/professions/combat/healer.svg' },
  { id: 'prof_archer', name: 'Ranger / Sharpshooter', description: 'Master of marksmanship, wilderness tracking, and perimeter scouting.', traits: ['Pinpoint Aim', 'Camouflage', 'Beast Tracking'], iconPath: '/assets/professions/combat/archer.svg' },
  { id: 'prof_assassin', name: 'Shadow Assassin / Infiltrator', description: 'Silent executioner striking from blind spots with fatal surgical precision.', traits: ['Silent Step', 'Concealed Blades', 'Anatomical Lethality'], iconPath: '/assets/professions/combat/assassin.svg' },
  { id: 'prof_rogue', name: 'Rogue / Trickster', description: 'Cunning scoundrel adept at bypassing security traps, picking locks, and lightning pickpocketing.', traits: ['Lockpicking', 'Trap Sense', 'Acrobatic Escape'], iconPath: '/assets/professions/combat/rogue.svg' },
  { id: 'prof_berserker', name: 'Berserker / Juggernaut', description: 'Fearless brawler whose offensive strength surges exponentially as health wanes in battle.', traits: ['Rage Momentum', 'Pain Immunity', 'Shattering Impact'], iconPath: '/assets/professions/combat/berserker.svg' },
  { id: 'prof_necromancer', name: 'Necromancer / Soul Weaver', description: 'Arcanist commanding the boundary between life and death, raising skeletal thralls and spirits.', traits: ['Soul Binding', 'Necrotic Touch', 'Corpse Puppetry'], iconPath: '/assets/professions/combat/necromancer.svg' },
  { id: 'prof_summoner', name: 'Summoner / Planar Caller', description: 'Conjurer forging contracts with otherworldly beasts, elementals, and celestial familiars.', traits: ['Familiar Bond', 'Planar Gate Inscription', 'Shared Senses'], iconPath: '/assets/professions/combat/summoner.svg' },
  { id: 'prof_monk', name: 'Martial Monk / Qi Fighter', description: 'Disciplined ascetic channeling inner spiritual energy into diamond-hard unarmed martial arts.', traits: ['Iron Body Qi', 'Rapid Flurry', 'Spiritual Centering'], iconPath: '/assets/professions/combat/monk.svg' },
  { id: 'prof_spearman', name: 'Spearman / Lancer', description: 'Reach fighter dominating the mid-range with piercing thrusts, sweeping arcs, and phalanx stances.', traits: ['Armor Penetration', 'Zone Control', 'Vaulting Leap'], iconPath: '/assets/professions/combat/spearman.svg' },

  // Non-Combat, Trade, Craft & Governance Roles
  { id: 'prof_merchant', name: 'Merchant / Trade Magnate', description: 'Economic powerhouse accumulating wealth, establishing trade routes, and managing cartels.', traits: ['Bargaining Edge', 'Supply Arbitrage', 'Contract Binding'], iconPath: '/assets/professions/non-combat/merchant.svg' },
  { id: 'prof_farmer', name: 'Agronomist / Master Farmer', description: 'Cultivator of bountiful harvests, rare magical flora, and sustainable ecosystems.', traits: ['Crop Optimization', 'Soil Vitalization', 'Ecosystem Balance'], iconPath: '/assets/professions/non-combat/farmer.svg' },
  { id: 'prof_blacksmith', name: 'Blacksmith / Weaponsmith', description: 'Master of the forge hammering ores into unbreakable weapons, armor, and implements.', traits: ['Metal Tempering', 'Anvil Mastery', 'Structural Diagnosis'], iconPath: '/assets/professions/non-combat/blacksmith.svg' },
  { id: 'prof_alchemist', name: 'Alchemist / Apothecary', description: 'Transmuter of elements distilling volatile acids, restorative elixirs, and catalysts.', traits: ['Potion Compounding', 'Chemical Distillation', 'Herb Extracting'], iconPath: '/assets/professions/non-combat/alchemist.svg' },
  { id: 'prof_scholar', name: 'Scholar / Sage / Researcher', description: 'Academic investigator uncovering forgotten history, lost languages, and arcane laws.', traits: ['Rapid Archival Search', 'Riddle Solving', 'Planar Lore'], iconPath: '/assets/professions/non-combat/scholar.svg' },
  { id: 'prof_doctor', name: 'Physician / Master Doctor', description: 'Clinical healer diagnosing complex bodily ailments, surgical trauma, and biological poisons.', traits: ['Anatomical Diagnosis', 'Field Surgery', 'Antidote Synthesis'], iconPath: '/assets/professions/non-combat/doctor.svg' },
  { id: 'prof_herbalist', name: 'Master Herbalist / Forager', description: 'Botanical specialist recognizing rare mountain roots, toxic flora, and therapeutic fungi.', traits: ['Flora Identification', 'Safe Foraging', 'Preservation Techniques'], iconPath: '/assets/professions/non-combat/herbalist.svg' },
  { id: 'prof_engineer', name: 'Arcane Engineer / Mechanist', description: 'Inventor of clockwork automata, magitech conduits, airships, and defensive traps.', traits: ['Blueprint Drafting', 'Mechanism Assembly', 'Power Grid Tuning'], iconPath: '/assets/professions/non-combat/engineer.svg' },
  { id: 'prof_architect', name: 'Architect / City Planner', description: 'Visionary master of stone fortifications, aqueducts, and magnificent palace design.', traits: ['Structural Integrity', 'Civic Logistics', 'Defensive Bastions'], iconPath: '/assets/professions/non-combat/architect.svg' },
  { id: 'prof_cook', name: 'Gourmet Chef / Potion Cook', description: 'Culinary artisan infusing magical beasts and herbs into dishes that bestow lingering stat buffs.', traits: ['Nutritional Buffing', 'Beast Flavoring', 'Restorative Cooking'], iconPath: '/assets/professions/non-combat/cook.svg' },
  { id: 'prof_tailor', name: 'Enchanter Tailor / Weaver', description: 'Weaver crafting silk robes, enchanted cloaks with stealth threads, and durable travel leather.', traits: ['Fabric Enchantment', 'Lightweight Armor', 'Disguise Tailoring'], iconPath: '/assets/professions/non-combat/tailor.svg' },
  { id: 'prof_diplomat', name: 'Diplomat / Negotiator', description: 'Envoy de-escalating war, formulating royal treaties, and forging alliance accords.', traits: ['Conflict De-escalation', 'International Law', 'Silver Tongue'], iconPath: '/assets/professions/non-combat/diplomat.svg' },
  { id: 'prof_strategist', name: 'Grand Strategist / Tactician', description: 'Commander maneuvering armies, forecasting weather advantages, and outsmarting generals.', traits: ['Battlefield Geometry', 'Troop Morale', 'Predictive Logistics'], iconPath: '/assets/professions/combat/swordsman.svg' },
  { id: 'prof_administrator', name: 'Administrator / Governor', description: 'Civic leader organizing tax revenues, grain reserves, infrastructure, and peace.', traits: ['Treasury Management', 'Civic Order', 'Fair Justice'], iconPath: '/assets/professions/non-combat/administrator.svg' },
  { id: 'prof_beast_tamer', name: 'Beast Tamer / Monster Whisperer', description: 'Specialist calming wild monsters, domesticating mounts, and commanding battle packs.', traits: ['Beast Empathy', 'Mount Training', 'Pheromone Calming'], iconPath: '/assets/professions/non-combat/beast-tamer.svg' },
  { id: 'prof_craftsman', name: 'Master Craftsman / Runecarver', description: 'Artisan etching runic matrices into jewelry, tools, furniture, and fortress masonry.', traits: ['Runic Inscription', 'Material Longevity', 'Flawless Finish'], iconPath: '/assets/professions/non-combat/craftsman.svg' },
  { id: 'prof_adventurer', name: 'Licensed Adventurer / Explorer', description: 'Jack of many frontier skills, mapping uncharted dungeons, ruins, and lost biomes.', traits: ['Survival Adaptation', 'Monster Lore', 'Cartography'], portraitPath: '/assets/characters/human/human-adventurer-portrait.png', iconPath: '/assets/professions/non-combat/explorer.svg' },
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
