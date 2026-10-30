import { StoryState } from '../types/story';
import { HeroProfile } from '../types/character';

export interface PredefinedScenarioNode {
  sceneId: string;
  chapterNumber: number;
  sceneTitle: string;
  narrativeText: string;
  dialogues?: Array<{ speaker: string; text: string; emotion?: 'calm' | 'furious' | 'mysterious' | 'terrified' | 'warm' }>;
  ambientVisual?: string;
  choices: Array<{
    choiceId: string;
    text: string;
    consequenceHint?: string;
    riskLevel?: 'safe' | 'moderate' | 'perilous';
    stateImpact?: Partial<StoryState>;
    nextSceneId: string;
  }>;
}

export interface ScenarioDefinition {
  worldId: string;
  title: string;
  initialState: (hero: HeroProfile) => StoryState;
  nodes: Record<string, PredefinedScenarioNode>;
}

export const STARTER_SCENARIOS: Record<string, ScenarioDefinition> = {
  aethelgard: {
    worldId: 'aethelgard',
    title: 'The Burning at Valen’s Crossing',
    initialState: (hero: HeroProfile): StoryState => ({
      health: 100,
      maxHealth: 100,
      stamina: 90,
      powerLevel: hero.powerLevel || 35,
      inventory: [
        { id: 'start_weapon', name: hero.weapons[0] || 'Iron Bastard Sword', quantity: 1, description: 'A reliable blade balanced for battle.', category: 'weapon' },
        { id: 'healing_salve', name: 'Elder-Leaf Healing Salve', quantity: 2, description: 'Restores 35 Stamina when applied to wounds.', category: 'consumable', effectDescription: '+35 Stamina' },
        { id: 'silver_talisman', name: 'Silver Vanguard Talisman', quantity: 1, description: 'An insignia proving allegiance to the realm’s protectors.', category: 'artifact' }
      ],
      activeQuests: [
        { id: 'quest_save_village', title: 'Defend Valen’s Crossing', giver: 'Captain Ronald', objective: 'Repel the void-rift marauders and secure the surviving villagers.', status: 'active' }
      ],
      worldFlags: { riftOpen: true, captainAlive: true },
      npcTrust: { 'Captain Ronald': 20, 'Villagers': 30, 'Masked Harbinger': -80 },
      statusEffects: ['Vigilant'],
      timelineStep: 1,
      currentLocation: 'Valen’s Crossing',
      isGameOver: false
    }),
    nodes: {
      'node_1': {
        sceneId: 'node_1',
        chapterNumber: 1,
        sceneTitle: 'Flames in the Night',
        narrativeText: 'Midnight arrives not with silence, but with the roar of violet thunder. Valen’s Crossing is enveloped in an eerie abyssal fog. Houses constructed from elder-timber crackle in purple witch-fire as rift beasts—hound-like creatures forged from obsidian glass—stalk through the village square. In the center, Captain Ronald kneels with a fractured shield, protecting three terrified children.',
        dialogues: [
          { speaker: 'Captain Ronald', text: 'Fall back to the sanctuary! The void rift opened without warning—they’re after the child with the leylight mark!', emotion: 'terrified' },
          { speaker: 'Masked Commander', text: 'Foolish knights. Hand over the seed of starlight, and your deaths will be swift.', emotion: 'calm' }
        ],
        ambientVisual: 'Flame',
        choices: [
          {
            choiceId: 'choice_rescue_kids',
            text: 'Draw your weapon and charge between Ronald and the rift beasts.',
            consequenceHint: 'High risk of injury, but greatly bolsters Ronald’s trust and defends the innocents.',
            riskLevel: 'moderate',
            stateImpact: {
              stamina: 75,
              npcTrust: { 'Captain Ronald': 60, 'Villagers': 70, 'Masked Harbinger': -100 }
            },
            nextSceneId: 'node_rescue_success'
          },
          {
            choiceId: 'choice_ambush_leader',
            text: 'Slip into the shadows and launch a surprise strike at the Masked Commander.',
            consequenceHint: 'Tactical gambit: bypasses the hounds to cut off the enemy leader directly.',
            riskLevel: 'perilous',
            stateImpact: {
              stamina: 60,
              health: 85
            },
            nextSceneId: 'node_ambush_boss'
          },
          {
            choiceId: 'choice_rune_barrier',
            text: 'Ignite your runic powers to manifest a barrier sealing off the village perimeter.',
            consequenceHint: 'Consumes immense stamina but shields the entire quadrant from reinforcements.',
            riskLevel: 'safe',
            stateImpact: {
              stamina: 40,
              health: 100
            },
            nextSceneId: 'node_barrier_hold'
          }
        ]
      },
      'node_rescue_success': {
        sceneId: 'node_rescue_success',
        chapterNumber: 2,
        sceneTitle: 'Shield of the Innocent',
        narrativeText: 'Steel clashes against crystallized claws with deafening sparks! Your strike cleaves the lead hound in twain, its abyssal essence dissolving into vapor. Captain Ronald stares in astonishment as you stand shoulder-to-shoulder with him. The children scramble through the barricade into the sanctuary safely.',
        dialogues: [
          { speaker: 'Captain Ronald', text: 'By the Archons... that strike! You fight like the legends of the Old Order. Take my sidearm—we finish this together!', emotion: 'warm' },
          { speaker: 'Masked Commander', text: 'An unexpected champion. But can your mortal blade pierce the Void Core?', emotion: 'mysterious' }
        ],
        ambientVisual: 'Shield',
        choices: [
          {
            choiceId: 'choice_press_advantage',
            text: 'Unleash your ultimate technique to shatter the Void Core directly.',
            consequenceHint: 'Requires maximum focus; could decisively end the rift incursion.',
            riskLevel: 'perilous',
            stateImpact: {
              stamina: 30,
              health: 80,
              powerLevel: 45
            },
            nextSceneId: 'node_final_clash'
          },
          {
            choiceId: 'choice_tactical_flank',
            text: 'Signal Ronald to draw the commander’s gaze while you sever the leylines sustaining the rift.',
            consequenceHint: 'Calculated tactical victory minimizing collateral damage.',
            riskLevel: 'safe',
            stateImpact: {
              stamina: 55,
              health: 95
            },
            nextSceneId: 'node_rift_sealed'
          }
        ]
      },
      'node_ambush_boss': {
        sceneId: 'node_ambush_boss',
        chapterNumber: 2,
        sceneTitle: 'Shadow and Steel',
        narrativeText: 'You step through the swirling smoke like a phantom. Your blade whistles toward the Commander’s throat, but his obsidian rapier parries with uncanny precision. The shockwave shatters the cobblestones beneath your boots! The Commander stumbles back, his mask cracking to reveal glowing violet eyes.',
        dialogues: [
          { speaker: 'Masked Commander', text: 'Impudent insect! You have delayed our Ascension for the last time!', emotion: 'furious' },
          { speaker: 'Captain Ronald', text: 'Hold fast, friend! I am coming to your aid!', emotion: 'warm' }
        ],
        ambientVisual: 'Sword',
        choices: [
          {
            choiceId: 'choice_counter_strike',
            text: 'Rip the cracked mask away to uncover the Commander’s true identity.',
            consequenceHint: 'Reveals a vital plot secret but leaves you exposed to a retaliatory blast.',
            riskLevel: 'perilous',
            stateImpact: {
              health: 70,
              stamina: 40
            },
            nextSceneId: 'node_secret_unmasked'
          },
          {
            choiceId: 'choice_shatter_weapon',
            text: 'Focus your power on his rapier to disarm the Commander before he casts.',
            consequenceHint: 'Safe tactical disarm, reducing the enemy’s lethality.',
            riskLevel: 'moderate',
            stateImpact: {
              stamina: 50,
              health: 90
            },
            nextSceneId: 'node_rift_sealed'
          }
        ]
      },
      'node_barrier_hold': {
        sceneId: 'node_barrier_hold',
        chapterNumber: 2,
        sceneTitle: 'The Runic Citadel',
        narrativeText: 'Rays of prismatic starlight erupt from your hands, anchoring into the soil. An incandescent translucent dome expands over the village square. The rift beasts howl in agony as they slam against the sacred boundary, their dark flesh smoking upon contact with the barrier.',
        dialogues: [
          { speaker: 'Villager Elder', text: 'The ancient runes live! The prophecy of the Starlight Bearer is true!', emotion: 'warm' },
          { speaker: 'Captain Ronald', text: 'The barrier is holding, but the rift pressure is peaking. What are your orders, warrior?', emotion: 'calm' }
        ],
        ambientVisual: 'Sparkles',
        choices: [
          {
            choiceId: 'choice_collapse_barrier_inward',
            text: 'Invert the barrier’s harmonic resonance to implode the rift at its epicenter.',
            consequenceHint: 'Decisively purges the rift but exhausts your magical reserves.',
            riskLevel: 'moderate',
            stateImpact: {
              stamina: 20,
              health: 95
            },
            nextSceneId: 'node_final_clash'
          },
          {
            choiceId: 'choice_secure_evacuation',
            text: 'Hold the perimeter until all wounded and villagers are evacuated to the high hills.',
            consequenceHint: 'Maximizes civilian survival and unlocks grateful faction allies.',
            riskLevel: 'safe',
            stateImpact: {
              stamina: 45,
              npcTrust: { 'Villagers': 100, 'Captain Ronald': 85 }
            },
            nextSceneId: 'node_rift_sealed'
          }
        ]
      },
      'node_final_clash': {
        sceneId: 'node_final_clash',
        chapterNumber: 3,
        sceneTitle: 'Dawn of the Starlight Hero',
        narrativeText: 'With a blinding roar of radiant energy, your attack detonates against the Void Core. The dimensional rift collapses into a single pinprick of light before dissolving into peaceful stardust. The morning sun crests over the mountains of Aethelgard, illuminating a cheer from the surviving villagers of Valen’s Crossing. Captain Ronald places a fist over his chest in profound reverence.',
        dialogues: [
          { speaker: 'Captain Ronald', text: 'You saved us all this night. As long as the Silver Vanguard stands, you will always have brothers-in-arms.', emotion: 'warm' }
        ],
        ambientVisual: 'Crown',
        choices: [
          {
            choiceId: 'choice_journey_continues',
            text: 'Accept the Vanguard’s commendation and prepare to journey to the Silver Spire.',
            consequenceHint: 'Begins the grand quest to warn the Archmagi of the looming void invasion.',
            riskLevel: 'safe',
            stateImpact: {
              timelineStep: 3,
              health: 100,
              stamina: 100,
              activeQuests: [
                { id: 'quest_save_village', title: 'Defend Valen’s Crossing', giver: 'Captain Ronald', objective: 'Repel the void-rift marauders.', status: 'completed' },
                { id: 'quest_silver_spire', title: 'Audience with the Archmagi', giver: 'Captain Ronald', objective: 'Travel to the Silver Spire and deliver the rift core fragment.', status: 'active' }
              ]
            },
            nextSceneId: 'node_journey_begins'
          }
        ]
      },
      'node_rift_sealed': {
        sceneId: 'node_rift_sealed',
        chapterNumber: 3,
        sceneTitle: 'Victory Over the Void',
        narrativeText: 'The rift fractures, snaps, and seals itself shut with a resounding chime that echoes across the valley. The Masked Commander dissolves into shadow with a parting curse: "You cannot halt what has already begun in the High Spire!" Valen’s Crossing is spared. You have gained the eternal devotion of the frontier folk.',
        dialogues: [
          { speaker: 'Elder Mira', text: 'Take this ancient relic, protector. It has rested in our crypt for generations awaiting someone worthy.', emotion: 'warm' }
        ],
        ambientVisual: 'Sparkles',
        choices: [
          {
            choiceId: 'choice_claim_reward',
            text: 'Accept the Elder’s relic and inspect its ancient inscriptions.',
            consequenceHint: 'Adds the Celestial Sunstone to your inventory.',
            riskLevel: 'safe',
            stateImpact: {
              inventory: [
                { id: 'sunstone', name: 'Celestial Sunstone', quantity: 1, description: 'An ancient relic that pulses with warm solar energy.', category: 'artifact', effectDescription: 'Grants steady stamina recovery and resilience.' }
              ],
              activeQuests: [
                { id: 'quest_save_village', title: 'Defend Valen’s Crossing', giver: 'Captain Ronald', objective: 'Repel the void-rift marauders.', status: 'completed' }
              ]
            },
            nextSceneId: 'node_journey_begins'
          }
        ]
      },
      'node_secret_unmasked': {
        sceneId: 'node_secret_unmasked',
        chapterNumber: 3,
        sceneTitle: 'The Broken Mirror',
        narrativeText: 'The cracked porcelain mask shatters onto the flagstones. Beneath it lies a familiar face—Lord Anthony, the First Advisor to the King of Aethelgard! "You understand nothing," he wheezes, clutching his wound. "The Archmagi are poisoning the leylines. The void was our only cure!" Before you can interrogate him further, an extraction portal whisks him away.',
        dialogues: [
          { speaker: 'Captain Ronald', text: 'Lord Anthony?! This treachery reaches the very throne! We must move swiftly.', emotion: 'furious' }
        ],
        ambientVisual: 'Eye',
        choices: [
          {
            choiceId: 'choice_ride_capital',
            text: 'Ride with Ronald directly to the royal capital to confront the council.',
            consequenceHint: 'Sets forth on a political intrigue and mystery narrative path.',
            riskLevel: 'moderate',
            stateImpact: {
              timelineStep: 3,
              activeQuests: [
                { id: 'quest_save_village', title: 'Defend Valen’s Crossing', giver: 'Captain Ronald', objective: 'Repel the void-rift marauders.', status: 'completed' },
                { id: 'quest_uncover_conspiracy', title: 'Treachery at the Capital', giver: 'Captain Ronald', objective: 'Infiltrate the capital and uncover Lord Anthony’s faction.', status: 'active' }
              ]
            },
            nextSceneId: 'node_journey_begins'
          }
        ]
      },
      'node_journey_begins': {
        sceneId: 'node_journey_begins',
        chapterNumber: 4,
        sceneTitle: 'The Open Road Awaits',
        narrativeText: 'The first chapter of your legend in BranchVerse concludes, but your grand journey across Aethelgard has only just dawned. The roads ahead lead into treacherous mountains, sparkling crystal forests, and the political storm brewing in the Royal Court. Your name is already carried on the lips of traveling bards.',
        ambientVisual: 'Compass',
        choices: [
          {
            choiceId: 'choice_camp_rest',
            text: 'Set camp under the starlit sky, sharpen your blades, and reflect on the road ahead.',
            consequenceHint: 'Fully restores stamina and battle focus.',
            riskLevel: 'safe',
            stateImpact: {
              stamina: 100
            },
            nextSceneId: 'node_1'
          }
        ]
      }
    }
  },
  neokyoto: {
    worldId: 'neokyoto',
    title: 'Extraction in District 4',
    initialState: (hero: HeroProfile): StoryState => ({
      health: 100,
      maxHealth: 100,
      stamina: 100,
      powerLevel: hero.powerLevel || 40,
      inventory: [
        { id: 'cyber_sidearm', name: hero.weapons[0] || 'Arakawa Heavy Rail Pistol', quantity: 1, description: 'Armor-piercing sidearm with smart-targeting optic.', category: 'weapon' },
        { id: 'trauma_stim', name: 'Militech Combat Stim', quantity: 2, description: 'Restores 40 Stamina and boosts sensory reflexes.', category: 'consumable', effectDescription: '+40 Stamina' },
        { id: 'cyberdeck', name: 'Arasaka MK-IV Neural Cyberdeck', quantity: 1, description: 'Direct neural interface loaded with counter-intrusion daemons.', category: 'artifact' }
      ],
      activeQuests: [
        { id: 'quest_extract_data', title: 'Data Heist 2099', giver: 'Fixer Nyx', objective: 'Infiltrate Arakawa Sub-Level 3 and extract the Project Chimera datashard.', status: 'active' }
      ],
      worldFlags: { alarmTripped: false, dronesActive: true },
      npcTrust: { 'Fixer Nyx': 40, 'Arakawa Security': -100 },
      statusEffects: ['Stealth Overdrive'],
      timelineStep: 1,
      currentLocation: 'District 4 Underbelly',
      isGameOver: false
    }),
    nodes: {
      'node_1': {
        sceneId: 'node_1',
        chapterNumber: 1,
        sceneTitle: 'Rain, Neon, and Gunfire',
        narrativeText: 'Acid rain cascades down the towering holographic billboards of District 4. You crouch atop a ventilation grate overlooking the rear loading dock of Arakawa Biotech. Below, two automated patrol drones hover on blue ion thrusters, their red laser sweeps scanning for bio-signatures. Inside the armored vault sits the Project Chimera datashard.',
        dialogues: [
          { speaker: 'Fixer Nyx (Comm Link)', text: 'You have a three-minute window before the orbital satellite realigns. Don’t trip the ICE, or Arakawa trauma teams will turn you into scrap.', emotion: 'calm' }
        ],
        ambientVisual: 'Cpu',
        choices: [
          {
            choiceId: 'choice_hack_drones',
            text: 'Jack your cyberdeck into the external junction box to upload a reboot daemon to the drones.',
            consequenceHint: 'Quiet tactical entry; risks neural backlash if the ICE fights back.',
            riskLevel: 'moderate',
            stateImpact: { stamina: 75 },
            nextSceneId: 'node_hack_route'
          },
          {
            choiceId: 'choice_mantis_drop',
            text: 'Engage your cloaking unit and drop directly onto the drone chassis with blades extended.',
            consequenceHint: 'Visceral combat takedown; fast and loud.',
            riskLevel: 'perilous',
            stateImpact: { stamina: 65, health: 85 },
            nextSceneId: 'node_combat_route'
          },
          {
            choiceId: 'choice_vent_crawl',
            text: 'Bypass the loading dock entirely by cutting through the high-pressure steam conduits.',
            consequenceHint: 'Safe stealth detour; costs more time and requires precise agility.',
            riskLevel: 'safe',
            stateImpact: { stamina: 85 },
            nextSceneId: 'node_stealth_route'
          }
        ]
      },
      'node_hack_route': {
        sceneId: 'node_hack_route',
        chapterNumber: 2,
        sceneTitle: 'Ghost in the Machine',
        narrativeText: 'Digital code streams across your synthetic optic nerve in neon green cascades. You blast through the Arakawa perimeter firewall with milliseconds to spare. Both drones freeze in midair, their optics blinking from hostile red to placid cyan as your daemon takes root.',
        dialogues: [
          { speaker: 'Fixer Nyx', text: 'Flawless breach! The vault doors are unlocking. Grab the shard and move!', emotion: 'warm' }
        ],
        ambientVisual: 'Zap',
        choices: [
          {
            choiceId: 'choice_grab_shard',
            text: 'Retrieve the Chimera datashard and sprint toward the extraction motorcycle.',
            consequenceHint: 'Mission accomplished with stealth rating S.',
            riskLevel: 'safe',
            stateImpact: {
              activeQuests: [
                { id: 'quest_extract_data', title: 'Data Heist 2099', giver: 'Fixer Nyx', objective: 'Infiltrate Arakawa Sub-Level 3.', status: 'completed' }
              ]
            },
            nextSceneId: 'node_heist_victory'
          }
        ]
      },
      'node_combat_route': {
        sceneId: 'node_combat_route',
        chapterNumber: 2,
        sceneTitle: 'High-Caliber Symphony',
        narrativeText: 'You drop from the sky like a thunderbolt! Your blades shear through the titanium drone hulls with an ear-splitting screech of metal and burning lubricant. Alarms shriek across the alleyway as security doors hiss open, revealing heavily augmented enforcers with sub-machine guns.',
        dialogues: [
          { speaker: 'Arakawa Enforcer', text: 'Target spotted! Open fire, authorize lethal force!', emotion: 'furious' }
        ],
        ambientVisual: 'Flame',
        choices: [
          {
            choiceId: 'choice_overclock_sandevistan',
            text: 'Trigger your Sandevistan neural booster to sprint past bullet trajectories and breach the vault.',
            consequenceHint: 'High reflex maneuver that puts your cyberware into overdrive.',
            riskLevel: 'perilous',
            stateImpact: { stamina: 30, health: 70 },
            nextSceneId: 'node_heist_victory'
          }
        ]
      },
      'node_stealth_route': {
        sceneId: 'node_stealth_route',
        chapterNumber: 2,
        sceneTitle: 'Shadows of District 4',
        narrativeText: 'Sliding through the condensed steam conduits, you avoid every camera sensor with surgical precision. Dropping silently into the cleanroom, the glowing crystalline datashard rests on an anti-gravity pedestal right before you.',
        ambientVisual: 'Eye',
        choices: [
          {
            choiceId: 'choice_extract_silent',
            text: 'Slot the datashard into your encrypted deck and slip into the night unnoticed.',
            riskLevel: 'safe',
            stateImpact: {
              activeQuests: [
                { id: 'quest_extract_data', title: 'Data Heist 2099', giver: 'Fixer Nyx', objective: 'Infiltrate Arakawa Sub-Level 3.', status: 'completed' }
              ]
            },
            nextSceneId: 'node_heist_victory'
          }
        ]
      },
      'node_heist_victory': {
        sceneId: 'node_heist_victory',
        chapterNumber: 3,
        sceneTitle: 'The Legend of the Underbelly',
        narrativeText: 'Roaring down the highway on your hover-cycle, the neon towers of Neo-Kyoto blur into streaks of violet and turquoise behind you. The encrypted datashard is safe in your pocket. Fixer Nyx credits 50,000 corporate credits to your offshore chip. Every underworld fixer in the city now knows your handle.',
        ambientVisual: 'Crown',
        choices: [
          {
            choiceId: 'choice_reset_cycle',
            text: 'Hide out at Doc Kuro’s clinic to upgrade your chrome for the next job.',
            riskLevel: 'safe',
            stateImpact: { health: 100, stamina: 100 },
            nextSceneId: 'node_1'
          }
        ]
      }
    }
  },
  kunlun: {
    worldId: 'kunlun',
    title: 'The Trial of Mount Kunlun',
    initialState: (hero: HeroProfile): StoryState => ({
      health: 100,
      maxHealth: 100,
      stamina: 100,
      powerLevel: hero.powerLevel || 50,
      inventory: [
        { id: 'spirit_sword', name: hero.weapons[0] || 'Azure Sky Spirit Sword', quantity: 1, description: 'Refined from thousand-year frost iron, hums with sword intent.', category: 'weapon' },
        { id: 'qi_pill', name: 'Nine-Turn Qi Restorative Pill', quantity: 3, description: 'Cleanses meridians and replenishes 35 Qi stamina instantly.', category: 'consumable', effectDescription: '+35 Stamina' }
      ],
      activeQuests: [
        { id: 'quest_tribulation', title: 'Pass the Heavenly Tribulation', giver: 'Sect Patriarch', objective: 'Withstand the ancestral lightning trial at the summit of Azure Peak.', status: 'active' }
      ],
      worldFlags: { goldenCoreFormed: false },
      npcTrust: { 'Sect Patriarch': 50, 'Fellow Disciples': 40 },
      statusEffects: ['Qi Resonance'],
      timelineStep: 1,
      currentLocation: 'Azure Cloud Sword Pavilion',
      isGameOver: false
    }),
    nodes: {
      'node_1': {
        sceneId: 'node_1',
        chapterNumber: 1,
        sceneTitle: 'The Thunderclouds Gather',
        narrativeText: 'Atop Azure Peak, howling winds billow through your daoist robes. Overhead, heavenly lightning swirls in concentric rings of gold and indigo. Elder disciples whisper in awe from the outer pavilion as the Dao of the Heavens tests your resolve. A spiritual lightning dragon descends from the heavens, teeth bared in primal fury.',
        dialogues: [
          { speaker: 'Sect Patriarch', text: 'Focus your heart, disciple! Do not succumb to heart demons, or your cultivation will scatter to the winds!', emotion: 'calm' }
        ],
        ambientVisual: 'Zap',
        choices: [
          {
            choiceId: 'choice_sword_intent',
            text: 'Unsheathe your sword and unleash the "Nine-Sun Heavenly Sword Intent" to cleave the dragon.',
            riskLevel: 'moderate',
            stateImpact: { stamina: 65, powerLevel: 65 },
            nextSceneId: 'node_breakthrough'
          },
          {
            choiceId: 'choice_body_refine',
            text: 'Channel the lightning directly into your meridians to temper your physical body into immortal diamond.',
            riskLevel: 'perilous',
            stateImpact: { health: 70, stamina: 40, powerLevel: 75 },
            nextSceneId: 'node_body_immortal'
          }
        ]
      },
      'node_breakthrough': {
        sceneId: 'node_breakthrough',
        chapterNumber: 2,
        sceneTitle: 'Golden Core Condensation',
        narrativeText: 'Sword intent soars like a dragon ascending into the celestial sphere! The heavenly lightning dragon shatters into shimmering golden particles that rain down upon the peak. Within your dantian, a radiant Golden Core solidifies with resplendent luminescence.',
        dialogues: [
          { speaker: 'Fellow Disciples', text: 'A peerless Golden Core! Senior brother has stepped into the realm of Immortals!', emotion: 'warm' }
        ],
        ambientVisual: 'Crown',
        choices: [
          {
            choiceId: 'choice_bow_patriarch',
            text: 'Bow respectfully to the Patriarch and assume your place as Sect Champion.',
            riskLevel: 'safe',
            stateImpact: {
              activeQuests: [
                { id: 'quest_tribulation', title: 'Pass the Heavenly Tribulation', giver: 'Sect Patriarch', objective: 'Withstand the ancestral lightning trial.', status: 'completed' }
              ]
            },
            nextSceneId: 'node_1'
          }
        ]
      },
      'node_body_immortal': {
        sceneId: 'node_body_immortal',
        chapterNumber: 2,
        sceneTitle: 'Vajra Immortal Flesh',
        narrativeText: 'Thunder sears your flesh, but your marrow glows with golden light. The lightning burns away mortal impurities, leaving your skin infused with the indestructible luster of ancient jade. You step forward, untouched by the tempest.',
        ambientVisual: 'Flame',
        choices: [
          {
            choiceId: 'choice_ascend_peak',
            text: 'Step upon your flying sword and soar above the clouds.',
            riskLevel: 'safe',
            nextSceneId: 'node_1'
          }
        ]
      }
    }
  }
};
