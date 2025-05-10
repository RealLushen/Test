// Game Configuration

// Class Configurations
const CLASSES = {
  paladin: {
    name: "Paladin",
    hp: 100,
    mana: 30,
    speed: 5,
    startingAbilities: ["sacredSword", "holyShield"],
    icon: "🛡️"
  },
  warrior: {
    name: "Warrior",
    hp: 120,
    mana: 20,
    speed: 4,
    startingAbilities: ["rage", "axeThrow"],
    icon: "⚔️"
  },
  rogue: {
    name: "Rogue",
    hp: 80,
    mana: 25,
    speed: 8,
    startingAbilities: ["flinkDagger", "revolverShot"],
    icon: "🗡️"
  },
  druid: {
    name: "Druid",
    hp: 90,
    mana: 35,
    speed: 6,
    startingAbilities: ["wrath", "summonTreant"],
    icon: "🌿"
  }
};

// Ability Cards
const ABILITIES = {
  // Paladin abilities
  sacredSword: {
    name: "Sacred Sword",
    icon: "⚔️",
    manaCost: 8,
    description: "Deal 10 damage + 5% extra for each 10 HP missing",
    effect: (player, enemy) => {
      const missingHP = player.maxHP - player.currentHP;
      const missingTens = Math.floor(missingHP / 10);
      const bonusDamage = Math.floor(10 * (missingTens * 0.05));
      const damage = 10 + bonusDamage;
      return {
        damage: damage,
        targetEnemy: true,
        log: `${player.nickname} uses Sacred Sword for ${damage} damage!`
      };
    }
  },
  holyShield: {
    name: "Holy Shield",
    icon: "🛡️",
    manaCost: 6,
    description: "Block 3 damage + 5% more for each 10 HP missing",
    effect: (player, enemy) => {
      const missingHP = player.maxHP - player.currentHP;
      const missingTens = Math.floor(missingHP / 10);
      const bonusBlock = Math.floor(3 * (missingTens * 0.05));
      const block = 3 + bonusBlock;
      
      player.block += block;
      
      return {
        damage: 0,
        targetEnemy: false,
        log: `${player.nickname} raises a Holy Shield blocking ${block} damage!`
      };
    }
  },
  
  // Warrior abilities
  rage: {
    name: "Rage",
    icon: "😡",
    manaCost: 5,
    description: "+10% Damage for 3 Rounds",
    effect: (player, enemy) => {
      player.effects.push({
        name: "Rage",
        icon: "😡",
        duration: 3,
        effect: "damageBonus",
        value: 0.1
      });
      
      return {
        damage: 0,
        targetEnemy: false,
        log: `${player.nickname} enters a Rage, increasing damage by 10% for 3 rounds!`
      };
    }
  },
  axeThrow: {
    name: "Axe Throw",
    icon: "🪓",
    manaCost: 7,
    description: "Throw 1-3 axes dealing 5 damage each",
    effect: (player, enemy) => {
      const axeCount = Math.floor(Math.random() * 3) + 1;
      const damage = axeCount * 5;
      
      return {
        damage: damage,
        targetEnemy: true,
        log: `${player.nickname} throws ${axeCount} axe${axeCount > 1 ? 's' : ''} for ${damage} damage!`
      };
    }
  },
  
  // Rogue abilities
  flinkDagger: {
    name: "Flink Dagger",
    icon: "🔪",
    manaCost: 6,
    description: "8 damage + 5% for each 5 HP enemy is missing",
    effect: (player, enemy) => {
      const missingHP = enemy.maxHP - enemy.currentHP;
      const missingFives = Math.floor(missingHP / 5);
      const bonusDamage = Math.floor(8 * (missingFives * 0.05));
      const damage = 8 + bonusDamage;
      
      return {
        damage: damage,
        targetEnemy: true,
        log: `${player.nickname} strikes with Flink Dagger for ${damage} damage!`
      };
    }
  },
  revolverShot: {
    name: "Revolver Shot",
    icon: "🔫",
    manaCost: 8,
    description: "Deals flat 15 damage",
    effect: (player, enemy) => {
      return {
        damage: 15,
        targetEnemy: true,
        log: `${player.nickname} fires a Revolver Shot for 15 damage!`
      };
    }
  },
  
  // Druid abilities
  wrath: {
    name: "Wrath",
    icon: "🌩️",
    manaCost: 7,
    description: "Deal 12 damage and heal 3 HP",
    effect: (player, enemy) => {
      player.heal(3);
      
      return {
        damage: 12,
        targetEnemy: true,
        log: `${player.nickname} casts Wrath for 12 damage and heals 3 HP!`
      };
    }
  },
  summonTreant: {
    name: "Summon Treant",
    icon: "🌳",
    manaCost: 9,
    description: "Enemy deals 15% less damage and takes 5 damage for one round",
    effect: (player, enemy) => {
      enemy.effects.push({
        name: "Treant",
        icon: "🌳",
        duration: 1,
        effect: "damageReduction",
        value: 0.15
      });
      
      return {
        damage: 5,
        targetEnemy: true,
        log: `${player.nickname} summons a Treant! Enemy takes 5 damage and will deal 15% less damage for one round.`
      };
    }
  },
  
  // Common abilities available to all classes
  fireball: {
    name: "Fireball",
    icon: "🔥",
    manaCost: 7,
    description: "Deal 12 damage",
    effect: (player, enemy) => {
      return {
        damage: 12,
        targetEnemy: true,
        log: `${player.nickname} casts Fireball for 12 damage!`
      };
    }
  },
  frostbolt: {
    name: "Frostbolt",
    icon: "❄️",
    manaCost: 6,
    description: "Deal 8 damage and slow enemy for 2 rounds",
    effect: (player, enemy) => {
      enemy.effects.push({
        name: "Slowed",
        icon: "❄️",
        duration: 2,
        effect: "speedReduction",
        value: 2
      });
      
      return {
        damage: 8,
        targetEnemy: true,
        log: `${player.nickname} casts Frostbolt for 8 damage and slows the enemy!`
      };
    }
  },
  healingPotion: {
    name: "Healing Potion",
    icon: "🧪",
    manaCost: 6,
    description: "Heal 10 HP",
    effect: (player, enemy) => {
      player.heal(10);
      
      return {
        damage: 0,
        targetEnemy: false,
        log: `${player.nickname} drinks a Healing Potion and restores 10 HP!`
      };
    }
  },
  manaPotion: {
    name: "Mana Potion",
    icon: "🧫",
    manaCost: 0,
    description: "Restore 12 Mana",
    effect: (player, enemy) => {
      player.restoreMana(12);
      
      return {
        damage: 0,
        targetEnemy: false,
        log: `${player.nickname} drinks a Mana Potion and restores 12 Mana!`
      };
    }
  },
  stun: {
    name: "Stun",
    icon: "💫",
    manaCost: 10,
    description: "Deal 5 damage and stun enemy for 1 round",
    effect: (player, enemy) => {
      enemy.effects.push({
        name: "Stunned",
        icon: "💫",
        duration: 1,
        effect: "stunned",
        value: true
      });
      
      return {
        damage: 5,
        targetEnemy: true,
        log: `${player.nickname} stuns the enemy and deals 5 damage!`
      };
    }
  },
  vampiricStrike: {
    name: "Vampiric Strike",
    icon: "🧛",
    manaCost: 8,
    description: "Deal 10 damage and heal for 50% of damage dealt",
    effect: (player, enemy) => {
      const healing = 5; // 50% of 10 damage
      player.heal(healing);
      
      return {
        damage: 10,
        targetEnemy: true,
        log: `${player.nickname} uses Vampiric Strike for 10 damage and heals for ${healing} HP!`
      };
    }
  },
  poisonDart: {
    name: "Poison Dart",
    icon: "🎯",
    manaCost: 7,
    description: "Deal 5 damage and apply poison for 3 rounds (3 damage per round)",
    effect: (player, enemy) => {
      enemy.effects.push({
        name: "Poisoned",
        icon: "☠️",
        duration: 3,
        effect: "damageOverTime",
        value: 3
      });
      
      return {
        damage: 5,
        targetEnemy: true,
        log: `${player.nickname} throws a Poison Dart for 5 damage and poisons the enemy!`
      };
    }
  },
  thunderStrike: {
    name: "Thunder Strike",
    icon: "⚡",
    manaCost: 9,
    description: "Deal 14 damage",
    effect: (player, enemy) => {
      return {
        damage: 14,
        targetEnemy: true,
        log: `${player.nickname} calls down Thunder Strike for 14 damage!`
      };
    }
  }
};

// Common card pool (abilities that can be randomly given)
const COMMON_CARD_POOL = [
  "fireball",
  "frostbolt",
  "healingPotion",
  "manaPotion",
  "stun",
  "vampiricStrike",
  "poisonDart",
  "thunderStrike"
];

// Enemy Types
const ENEMIES = [
  // Level 1-4
  {
    name: "Forest Wolf",
    icon: "🐺",
    hp: 40,
    damage: [5, 8],
    levelRange: [1, 4],
    xpReward: 30,
    actions: [
      { name: "Bite", damage: [5, 8], description: "The wolf bites for {damage} damage!" },
      { name: "Howl", damage: [0, 0], effect: "damageBonus", value: 0.1, duration: 2, description: "The wolf howls, increasing its damage by 10% for 2 rounds!" }
    ]
  },
  {
    name: "Goblin Scout",
    icon: "👺",
    hp: 35,
    damage: [4, 7],
    levelRange: [1, 4],
    xpReward: 25,
    actions: [
      { name: "Dagger", damage: [4, 7], description: "The goblin stabs with a dagger for {damage} damage!" },
      { name: "Evade", damage: [0, 0], effect: "block", value: 3, description: "The goblin dodges, blocking the next 3 damage!" }
    ]
  },
  {
    name: "Skeleton Warrior",
    icon: "💀",
    hp: 45,
    damage: [6, 9],
    levelRange: [1, 4],
    xpReward: 35,
    actions: [
      { name: "Bone Club", damage: [6, 9], description: "The skeleton swings its bone club for {damage} damage!" },
      { name: "Reassemble", damage: [0, 0], effect: "heal", value: 5, description: "The skeleton reassembles, healing 5 HP!" }
    ]
  },
  
  // Level 5-7
  {
    name: "Orc Raider",
    icon: "👹",
    hp: 65,
    damage: [8, 12],
    levelRange: [5, 7],
    xpReward: 45,
    actions: [
      { name: "Battle Axe", damage: [8, 12], description: "The orc swings its battle axe for {damage} damage!" },
      { name: "War Cry", damage: [0, 0], effect: "damageBonus", value: 0.15, duration: 2, description: "The orc lets out a war cry, increasing its damage by 15% for 2 rounds!" },
      { name: "Charge", damage: [10, 15], description: "The orc charges forward for {damage} damage!" }
    ]
  },
  {
    name: "Dark Mage",
    icon: "🧙",
    hp: 55,
    damage: [10, 14],
    levelRange: [5, 7],
    xpReward: 50,
    actions: [
      { name: "Shadow Bolt", damage: [10, 14], description: "The mage casts Shadow Bolt for {damage} damage!" },
      { name: "Life Drain", damage: [6, 8], effect: "lifeSteal", description: "The mage drains your life for {damage} damage and heals itself!" },
      { name: "Arcane Shield", damage: [0, 0], effect: "block", value: 5, description: "The mage creates an Arcane Shield, blocking the next 5 damage!" }
    ]
  },
  
  // Level 8-15
  {
    name: "Minotaur",
    icon: "🐂",
    hp: 90,
    damage: [12, 18],
    levelRange: [8, 15],
    xpReward: 65,
    actions: [
      { name: "Gore", damage: [12, 18], description: "The minotaur gores you with its horns for {damage} damage!" },
      { name: "Stomp", damage: [8, 12], effect: "stun", duration: 1, description: "The minotaur stomps the ground for {damage} damage and stuns you for 1 round!" },
      { name: "Rage", damage: [0, 0], effect: "damageBonus", value: 0.2, duration: 3, description: "The minotaur enters a rage, increasing its damage by 20% for 3 rounds!" }
    ]
  },
  {
    name: "Ancient Guardian",
    icon: "🗿",
    hp: 110,
    damage: [10, 15],
    levelRange: [8, 15],
    xpReward: 70,
    actions: [
      { name: "Stone Fist", damage: [10, 15], description: "The guardian strikes with a stone fist for {damage} damage!" },
      { name: "Earth Shield", damage: [0, 0], effect: "block", value: 8, description: "The guardian raises an Earth Shield, blocking the next 8 damage!" },
      { name: "Petrify", damage: [5, 8], effect: "speedReduction", value: 3, duration: 2, description: "The guardian partially petrifies you for {damage} damage and reduces your speed by 3 for 2 rounds!" }
    ]
  },
  
  // Level 16-25
  {
    name: "Dragon Wyrmling",
    icon: "🐉",
    hp: 150,
    damage: [15, 22],
    levelRange: [16, 25],
    xpReward: 90,
    actions: [
      { name: "Fire Breath", damage: [15, 22], description: "The dragon breathes fire for {damage} damage!" },
      { name: "Claw Swipe", damage: [10, 15], effect: "bleed", value: 3, duration: 3, description: "The dragon swipes with its claws for {damage} damage and causes you to bleed for 3 damage per round for 3 rounds!" },
      { name: "Wing Gust", damage: [8, 12], effect: "stunChance", value: 0.3, description: "The dragon flaps its wings for {damage} damage with a 30% chance to stun you for 1 round!" },
      { name: "Dragon Scales", damage: [0, 0], effect: "damageReduction", value: 0.2, duration: 2, description: "The dragon's scales harden, reducing incoming damage by 20% for 2 rounds!" }
    ]
  },
  {
    name: "Lich",
    icon: "🧙‍♂️",
    hp: 130,
    damage: [18, 25],
    levelRange: [16, 25],
    xpReward: 100,
    actions: [
      { name: "Necrotic Blast", damage: [18, 25], description: "The lich casts Necrotic Blast for {damage} damage!" },
      { name: "Soul Drain", damage: [12, 16], effect: "manaReduction", value: 5, description: "The lich drains your soul for {damage} damage and reduces your mana by 5!" },
      { name: "Summon Undead", damage: [8, 12], effect: "summon", value: "skeleton", description: "The lich summons a skeleton minion that attacks for {damage} damage!" },
      { name: "Death Ward", damage: [0, 0], effect: "damageReduction", value: 0.25, duration: 2, description: "The lich casts Death Ward, reducing incoming damage by 25% for 2 rounds!" }
    ]
  },
  
  // Level 26+
  {
    name: "Ancient Dragon",
    icon: "🐲",
    hp: 220,
    damage: [25, 35],
    levelRange: [26, 100],
    xpReward: 150,
    actions: [
      { name: "Inferno Breath", damage: [25, 35], description: "The ancient dragon unleashes an inferno for {damage} damage!" },
      { name: "Tail Swipe", damage: [15, 25], effect: "knockback", value: 1, description: "The dragon swipes its tail for {damage} damage and knocks you back, preventing your next action!" },
      { name: "Devastating Roar", damage: [10, 15], effect: "debuff", value: { effect: "damageReduction", value: -0.2, duration: 2 }, description: "The dragon roars for {damage} damage and weakens you, increasing damage taken by 20% for 2 rounds!" },
      { name: "Ancient Magic", damage: [20, 30], effect: "manaReduce", value: 10, description: "The dragon uses ancient magic for {damage} damage and drains 10 mana!" },
      { name: "Draconic Presence", damage: [0, 0], effect: "damageBonus", value: 0.3, duration: 3, description: "The dragon's presence intensifies, increasing its damage by 30% for 3 rounds!" }
    ]
  },
  {
    name: "Chaos Devourer",
    icon: "👾",
    hp: 200,
    damage: [20, 30],
    levelRange: [26, 100],
    xpReward: 140,
    actions: [
      { name: "Void Strike", damage: [20, 30], description: "The Chaos Devourer strikes from the void for {damage} damage!" },
      { name: "Reality Tear", damage: [15, 25], effect: "confusion", duration: 1, description: "The devourer tears reality for {damage} damage and confuses you for 1 round!" },
      { name: "Consume Essence", damage: [10, 20], effect: "healPercent", value: 0.5, description: "The devourer consumes your essence for {damage} damage and heals for 50% of the damage dealt!" },
      { name: "Chaos Shield", damage: [0, 0], effect: "reflect", value: 0.3, duration: 2, description: "The devourer creates a Chaos Shield, reflecting 30% of damage back to you for 2 rounds!" },
      { name: "Dark Entropy", damage: [5, 10], effect: "dotRandom", value: {min: 3, max: 8}, duration: 4, description: "The devourer unleashes dark entropy for {damage} damage and inflicts random damage over time for 4 rounds!" }
    ]
  }
];

// Mutations
const MUTATIONS = [
  // Positive Mutations
  {
    name: "Vitality",
    description: "Increase maximum HP by 15%",
    type: "positive",
    effect: (player) => {
      const hpIncrease = Math.floor(player.maxHP * 0.15);
      player.maxHP += hpIncrease;
      player.currentHP += hpIncrease;
      return `Maximum HP increased by ${hpIncrease} to ${player.maxHP}!`;
    }
  },
  {
    name: "Arcane Mind",
    description: "Increase maximum Mana by 20%",
    type: "positive",
    effect: (player) => {
      const manaIncrease = Math.floor(player.maxMana * 0.2);
      player.maxMana += manaIncrease;
      player.currentMana += manaIncrease;
      return `Maximum Mana increased by ${manaIncrease} to ${player.maxMana}!`;
    }
  },
  {
    name: "Swiftness",
    description: "Increase Speed by 2",
    type: "positive",
    effect: (player) => {
      player.speed += 2;
      return `Speed increased by 2 to ${player.speed}!`;
    }
  },
  {
    name: "Berserker Blood",
    description: "Deal 15% more damage when below 50% HP",
    type: "positive",
    effect: (player) => {
      player.passives.push({
        name: "Berserker Blood",
        condition: "lowHealth",
        threshold: 0.5,
        effect: "damageBonus",
        value: 0.15
      });
      return "When below 50% HP, you'll deal 15% more damage!";
    }
  },
  {
    name: "Vampirism",
    description: "Heal for 10% of damage dealt",
    type: "positive",
    effect: (player) => {
      player.passives.push({
        name: "Vampirism",
        effect: "lifeSteal",
        value: 0.1
      });
      return "You now heal for 10% of all damage you deal!";
    }
  },
  {
    name: "Arcane Efficiency",
    description: "Abilities cost 15% less mana",
    type: "positive",
    effect: (player) => {
      player.passives.push({
        name: "Arcane Efficiency",
        effect: "manaCostReduction",
        value: 0.15
      });
      return "All abilities now cost 15% less mana!";
    }
  },
  {
    name: "Critical Strike",
    description: "20% chance to deal double damage",
    type: "positive",
    effect: (player) => {
      player.passives.push({
        name: "Critical Strike",
        effect: "criticalChance",
        value: 0.2,
        multiplier: 2
      });
      return "You now have a 20% chance to deal double damage on attacks!";
    }
  },
  {
    name: "Quick Recovery",
    description: "Regenerate 5 HP at the start of each turn",
    type: "positive",
    effect: (player) => {
      player.passives.push({
        name: "Quick Recovery",
        effect: "healthRegen",
        value: 5
      });
      return "You'll regenerate 5 HP at the start of each turn!";
    }
  },
  {
    name: "Arcane Flow",
    description: "Regenerate 3 additional Mana each turn",
    type: "positive",
    effect: (player) => {
      player.passives.push({
        name: "Arcane Flow",
        effect: "manaRegen",
        value: 3
      });
      return "You'll regenerate 3 additional Mana at the start of each turn!";
    }
  },
  {
    name: "Thorns",
    description: "Reflect 15% of damage taken back to the enemy",
    type: "positive",
    effect: (player) => {
      player.passives.push({
        name: "Thorns",
        effect: "damageReflect",
        value: 0.15
      });
      return "You now reflect 15% of damage taken back to enemies!";
    }
  },
  {
    name: "Arcane Insight",
    description: "Gain an additional card in your hand",
    type: "positive",
    effect: (player) => {
      player.handSize += 1;
      return `Your hand size has increased to ${player.handSize} cards!`;
    }
  },
  {
    name: "Mastery",
    description: "Learn a new random ability",
    type: "positive",
    effect: (player) => {
      const availableCards = COMMON_CARD_POOL.filter(card => !player.deck.includes(card));
      if (availableCards.length === 0) {
        return "You already know all available abilities!";
      }
      
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      player.deck.push(randomCard);
      
      return `You learned a new ability: ${ABILITIES[randomCard].name}!`;
    }
  },

  // Neutral Mutations
  {
    name: "Glass Cannon",
    description: "Deal 30% more damage but take 15% more damage",
    type: "neutral",
    effect: (player) => {
      player.passives.push({
        name: "Glass Cannon (Damage)",
        effect: "damageBonus",
        value: 0.3
      });
      player.passives.push({
        name: "Glass Cannon (Vulnerability)",
        effect: "damageVulnerability",
        value: 0.15
      });
      return "You now deal 30% more damage but also take 15% more damage!";
    }
  },
  {
    name: "Blood Magic",
    description: "Abilities cost 25% less mana but cost 5 HP to cast",
    type: "neutral",
    effect: (player) => {
      player.passives.push({
        name: "Blood Magic (Mana)",
        effect: "manaCostReduction",
        value: 0.25
      });
      player.passives.push({
        name: "Blood Magic (Health)",
        effect: "hpCost",
        value: 5
      });
      return "Abilities cost 25% less mana but also cost 5 HP to cast!";
    }
  },
  {
    name: "Dual Nature",
    description: "Your attacks have a 50% chance to deal 50% more damage or 25% less damage",
    type: "neutral",
    effect: (player) => {
      player.passives.push({
        name: "Dual Nature",
        effect: "dualNature",
        value: 0.5,
        bonusAmount: 0.5,
        penaltyAmount: 0.25
      });
      return "Your attacks now have a 50% chance to deal 50% more damage or 25% less damage!";
    }
  },
  {
    name: "Elemental Shift",
    description: "Every turn, gain +20% damage of a random element but -10% to others",
    type: "neutral",
    effect: (player) => {
      player.passives.push({
        name: "Elemental Shift",
        effect: "elementalShift",
        bonusAmount: 0.2,
        penaltyAmount: 0.1
      });
      return "Each turn, you'll gain +20% damage of a random element but -10% to others!";
    }
  },
  {
    name: "Wildcard",
    description: "Your abilities have 20% more random effect (more or less powerful)",
    type: "neutral",
    effect: (player) => {
      player.passives.push({
        name: "Wildcard",
        effect: "randomEffectVariance",
        value: 0.2
      });
      return "Your abilities now have effects that are 20% more random (could be stronger or weaker)!";
    }
  },

  // Negative Mutations
  {
    name: "Fragility",
    description: "Take 15% more damage from all sources",
    type: "negative",
    effect: (player) => {
      player.passives.push({
        name: "Fragility",
        effect: "damageVulnerability",
        value: 0.15
      });
      return "You now take 15% more damage from all sources!";
    }
  },
  {
    name: "Clumsy",
    description: "Reduce Speed by 2",
    type: "negative",
    effect: (player) => {
      player.speed = Math.max(1, player.speed - 2);
      return `Speed reduced by 2 to ${player.speed}!`;
    }
  },
  {
    name: "Mana Burn",
    description: "Lose 2 Mana at the start of each turn",
    type: "negative",
    effect: (player) => {
      player.passives.push({
        name: "Mana Burn",
        effect: "manaDrain",
        value: 2
      });
      return "You'll lose 2 Mana at the start of each turn!";
    }
  },
  {
    name: "Weakness",
    description: "Deal 10% less damage with all abilities",
    type: "negative",
    effect: (player) => {
      player.passives.push({
        name: "Weakness",
        effect: "damageReduction",
        value: 0.1
      });
      return "All your abilities now deal 10% less damage!";
    }
  },
  {
    name: "Amnesia",
    description: "Lose one random ability from your deck",
    type: "negative",
    effect: (player) => {
      // Don't remove class abilities
      const nonClassAbilities = player.deck.filter(
        ability => !player.classAbilities.includes(ability)
      );
      
      if (nonClassAbilities.length === 0) {
        return "You have no additional abilities to forget!";
      }
      
      const randomIndex = Math.floor(Math.random() * nonClassAbilities.length);
      const abilityToRemove = nonClassAbilities[randomIndex];
      const abilityName = ABILITIES[abilityToRemove].name;
      
      player.deck = player.deck.filter(ability => ability !== abilityToRemove);
      
      return `You've forgotten how to use ${abilityName}!`;
    }
  }
];

// Helper function to get mutations for selection
function getRandomMutations(count = 3) {
  // Clone the mutations array to avoid modifying the original
  const availableMutations = [...MUTATIONS];
  const selectedMutations = [];
  
  // Ensure we have at least one of each type if possible
  const types = ["positive", "neutral", "negative"];
  
  for (const type of types) {
    const mutationsOfType = availableMutations.filter(m => m.type === type);
    
    if (mutationsOfType.length > 0) {
      const randomIndex = Math.floor(Math.random() * mutationsOfType.length);
      const selectedMutation = mutationsOfType[randomIndex];
      
      selectedMutations.push(selectedMutation);
      
      // Remove the selected mutation from available pool
      const globalIndex = availableMutations.findIndex(m => m.name === selectedMutation.name);
      if (globalIndex !== -1) {
        availableMutations.splice(globalIndex, 1);
      }
    }
  }
  
  // Fill remaining slots with random mutations
  while (selectedMutations.length < count && availableMutations.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableMutations.length);
    selectedMutations.push(availableMutations[randomIndex]);
    availableMutations.splice(randomIndex, 1);
  }
  
  // Shuffle the array to randomize order
  return shuffleArray(selectedMutations.slice(0, count));
}

// Helper function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// XP needed for each level
function getXPForNextLevel(level) {
  // Exponential growth formula
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

// Get a random enemy based on player level
function getRandomEnemy(playerLevel) {
  // Filter enemies by level range
  const eligibleEnemies = ENEMIES.filter(
    enemy => playerLevel >= enemy.levelRange[0] && playerLevel <= enemy.levelRange[1]
  );
  
  if (eligibleEnemies.length === 0) {
    // Fallback to highest level enemies if none match the range
    return ENEMIES.filter(enemy => enemy.levelRange[1] >= 26)[Math.floor(Math.random() * ENEMIES.filter(enemy => enemy.levelRange[1] >= 26).length)];
  }
  
  // Return a random enemy from the filtered list
  return eligibleEnemies[Math.floor(Math.random() * eligibleEnemies.length)];
}

// Get random cards for player hand
function getRandomCards(player, count) {
  const cards = [];
  const availableCards = [...player.deck];
  
  for (let i = 0; i < count && availableCards.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    cards.push(availableCards[randomIndex]);
    availableCards.splice(randomIndex, 1);
  }
  
  return cards;
}