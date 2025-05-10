document.addEventListener('DOMContentLoaded', () => {
  // Game State
  const gameState = {
    player: null,
    enemy: null,
    enemiesDefeated: 0, // Track enemies defeated separately
    round: 1, // Current round (enemy number)
    isPlayerTurn: true,
    battleLog: [],
    activeMutations: [],
    handCards: [],
    turn: 1 // Counter for turns within a round
  };

  // DOM Elements - Remove elements that no longer exist in the HTML
  const playerNicknameElem = document.getElementById('player-nickname');
  const playerClassElem = document.getElementById('player-class');
  const playerLevelElem = document.getElementById('player-level');
  const playerXpElem = document.getElementById('player-xp');
  const xpNeededElem = document.getElementById('xp-needed');
  const xpBarElem = document.getElementById('xp-bar');
  const roundsSurvivedElem = document.getElementById('rounds-survived');
  const enemyNameElem = document.getElementById('enemy-name');
  const enemyLevelElem = document.getElementById('enemy-level');
  const playerAvatarElem = document.getElementById('player-avatar');
  const enemyAvatarElem = document.getElementById('enemy-avatar');
  const playerEffectsElem = document.getElementById('player-effects');
  const enemyEffectsElem = document.getElementById('enemy-effects');
  const battleLogElem = document.getElementById('battle-log');
  const handContainerElem = document.getElementById('hand-container');
  const defendButtonElem = document.getElementById('defend-button');
  const replenishButtonElem = document.getElementById('replenish-button');
  const endTurnButtonElem = document.getElementById('end-turn-button');
  const mutationsListElem = document.getElementById('mutations-list');
  const mutationSelectionElem = document.getElementById('mutation-selection');
  const mutationChoicesElem = document.getElementById('mutation-choices');
  const gameOverElem = document.getElementById('game-over');
  const finalNicknameElem = document.getElementById('final-nickname');
  const finalClassElem = document.getElementById('final-class');
  const finalRoundsElem = document.getElementById('final-rounds');
  const finalLevelElem = document.getElementById('final-level');
  const finalMutationsElem = document.getElementById('final-mutations');
  const returnToMenuElem = document.getElementById('return-to-menu');

  // Initialize the game
  function initGame() {
    // Load player data from localStorage
    const playerData = JSON.parse(localStorage.getItem('arkaniumPlayer'));
    
    if (!playerData || !playerData.nickname || !playerData.class) {
      // Redirect to main menu if no player data
      window.location.href = 'index.html';
      return;
    }
    
    // Create player based on class
    const classConfig = CLASSES[playerData.class];
    
    gameState.player = {
      nickname: playerData.nickname,
      className: classConfig.name,
      maxHP: classConfig.hp,
      currentHP: classConfig.hp,
      maxMana: classConfig.mana,
      currentMana: classConfig.mana,
      speed: classConfig.speed,
      level: 1,
      xp: 0,
      xpNeeded: getXPForNextLevel(1),
      icon: classConfig.icon,
      classAbilities: classConfig.startingAbilities,
      deck: [...classConfig.startingAbilities, ...COMMON_CARD_POOL.slice(0, 3)], // Start with 2 class abilities and 3 random common abilities
      effects: [],
      passives: [],
      block: 0,
      handSize: 3, // Start with 3 cards, will increase with level
      
      // Methods
      takeDamage: function(amount) {
        // Apply damage reduction passives
        let reducedAmount = amount;
        
        // Apply damage vulnerability passives
        this.passives.forEach(passive => {
          if (passive.effect === 'damageVulnerability') {
            reducedAmount *= (1 + passive.value);
          }
        });
        
        // Apply block
        if (this.block > 0) {
          if (reducedAmount <= this.block) {
            this.block -= reducedAmount;
            logBattle(`${this.nickname} blocks ${reducedAmount} damage!`);
            reducedAmount = 0;
          } else {
            logBattle(`${this.nickname} blocks ${this.block} damage!`);
            reducedAmount -= this.block;
            this.block = 0;
          }
        }
        
        if (reducedAmount > 0) {
          this.currentHP = Math.max(0, this.currentHP - Math.floor(reducedAmount));
          logBattle(`${this.nickname} takes ${Math.floor(reducedAmount)} damage!`);
          
          // Check for thorns passive
          this.passives.forEach(passive => {
            if (passive.effect === 'damageReflect') {
              const reflectDamage = Math.floor(amount * passive.value);
              gameState.enemy.takeDamage(reflectDamage);
              logBattle(`${this.nickname}'s thorns reflect ${reflectDamage} damage!`);
            }
          });
          
          updateUI();
          
          // Check if player died
          if (this.currentHP <= 0) {
            gameOver();
          }
        }
      },
      
      heal: function(amount) {
        const oldHP = this.currentHP;
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
        const actualHeal = this.currentHP - oldHP;
        logBattle(`${this.nickname} heals for ${actualHeal} HP!`);
        updateUI();
      },
      
      useMana: function(amount) {
        // Apply mana cost reduction
        let reducedAmount = amount;
        this.passives.forEach(passive => {
          if (passive.effect === 'manaCostReduction') {
            reducedAmount = Math.max(1, Math.floor(reducedAmount * (1 - passive.value)));
          }
        });
        
        if (this.currentMana >= reducedAmount) {
          this.currentMana -= reducedAmount;
          
          // Apply blood magic if applicable
          this.passives.forEach(passive => {
            if (passive.effect === 'hpCost') {
              this.takeDamage(passive.value);
              logBattle(`${this.nickname} sacrifices ${passive.value} HP to cast!`);
            }
          });
          
          updateUI();
          return true;
        }
        return false;
      },
      
      restoreMana: function(amount) {
        const oldMana = this.currentMana;
        this.currentMana = Math.min(this.maxMana, this.currentMana + amount);
        const actualRestore = this.currentMana - oldMana;
        if (actualRestore > 0) {
          logBattle(`${this.nickname} restores ${actualRestore} Mana!`);
        }
        updateUI();
      },
      
      gainXP: function(amount) {
        this.xp += amount;
        logBattle(`${this.nickname} gains ${amount} XP!`);
        
        while (this.xp >= this.xpNeeded) {
          this.levelUp();
        }
        
        updateUI();
      },
      
      levelUp: function() {
        this.level++;
        this.xp -= this.xpNeeded;
        this.xpNeeded = getXPForNextLevel(this.level);
        
        // No automatic stat increases with level anymore
        // The only way to increase stats is through mutations or cards
        
        // Adjust hand size based on level
        if (this.level === 6) {
          this.handSize = 5;
        } else if (this.level === 16) {
          this.handSize = 7;
        } else if (this.level === 26) {
          this.handSize = 8;
        }
        
        logBattle(`${this.nickname} reached level ${this.level}!`);
        
        if ([6, 16, 26].includes(this.level)) {
          logBattle(`Hand size increased to ${this.handSize} cards!`);
        }
        
        updateUI();
      }
    };
    
    // Create first enemy
    spawnEnemy();
    
    // Initialize UI
    updateUI();
    renderPlayerAvatar();
    
    // Draw initial hand
    drawHand();
    
    // Event listeners
    defendButtonElem.addEventListener('click', defendAction);
    replenishButtonElem.addEventListener('click', replenishManaAction);
    endTurnButtonElem.addEventListener('click', endTurn);
    returnToMenuElem.addEventListener('click', returnToMenu);
    
    // Add welcome message
    logBattle(`Welcome to Arkanium, ${gameState.player.nickname} the ${gameState.player.className}!`);
    logBattle(`=== Round ${gameState.round} ===`);
    logBattle(`You encounter a ${gameState.enemy.name}!`);
    logBattle(`----- Turn ${gameState.turn}: Your Move -----`);
  }
  
  // Spawn a new enemy based on player level
  function spawnEnemy() {
    const enemyTemplate = getRandomEnemy(gameState.player.level);
    const enemyLevel = gameState.player.level;
    
    gameState.enemy = {
      name: enemyTemplate.name,
      level: enemyLevel,
      maxHP: enemyTemplate.hp,
      currentHP: enemyTemplate.hp,
      baseDamage: enemyTemplate.damage,
      xpReward: enemyTemplate.xpReward,
      icon: enemyTemplate.icon,
      actions: enemyTemplate.actions,
      effects: [],
      
      // Methods
      takeDamage: function(amount) {
        // Apply damage reduction from effects
        let finalDamage = amount;
        this.effects.forEach(effect => {
          if (effect.effect === 'damageReduction') {
            finalDamage *= (1 - effect.value);
          }
        });
        
        finalDamage = Math.floor(finalDamage);
        this.currentHP = Math.max(0, this.currentHP - finalDamage);
        
        updateUI();
        
        // Check if enemy died
        if (this.currentHP <= 0) {
          roundWon();
        }
      },
      
      performAction: function() {
        // Check if stunned
        const stunEffect = this.effects.find(effect => effect.effect === 'stunned');
        if (stunEffect) {
          logBattle(`${this.name} is stunned and cannot act!`);
          return;
        }
        
        // Pick a random action
        const actionIndex = Math.floor(Math.random() * this.actions.length);
        const action = this.actions[actionIndex];
        
        // Calculate damage
        let damage = 0;
        if (action.damage && Array.isArray(action.damage) && action.damage.length === 2) {
          // Random damage in range
          damage = Math.floor(Math.random() * (action.damage[1] - action.damage[0] + 1)) + action.damage[0];
          
          // Apply damage bonuses from effects
          this.effects.forEach(effect => {
            if (effect.effect === 'damageBonus') {
              damage = Math.floor(damage * (1 + effect.value));
            }
          });
        }
        
        // Apply effect
        if (action.effect) {
          switch(action.effect) {
            case 'damageBonus':
              this.effects.push({
                name: action.name,
                icon: '💪',
                duration: action.duration,
                effect: 'damageBonus',
                value: action.value
              });
              break;
            case 'block':
              // Enemy block mechanics if needed
              break;
            case 'heal':
              const healAmount = action.value;
              this.currentHP = Math.min(this.maxHP, this.currentHP + healAmount);
              break;
            case 'lifeSteal':
              this.currentHP = Math.min(this.maxHP, this.currentHP + Math.floor(damage / 2));
              break;
            // More effects can be added here
          }
        }
        
        // Log the action
        let description = action.description.replace('{damage}', damage);
        logBattle(description);
        
        // Deal damage if applicable
        if (damage > 0) {
          gameState.player.takeDamage(damage);
        }
        
        updateUI();
        
        // Check for battle end
        if (gameState.player.currentHP <= 0) {
          gameOver();
        }
      }
    };
    
    renderEnemyAvatar();
  }
  
  // Combat actions
  function useAbility(abilityId) {
    const ability = ABILITIES[abilityId];
    
    // Check if player has enough mana
    if (!gameState.player.useMana(ability.manaCost)) {
      logBattle("Not enough mana!");
      return;
    }
    
    // Execute ability effect
    const result = ability.effect(gameState.player, gameState.enemy);
    
    // Apply damage
    if (result.damage > 0 && result.targetEnemy) {
      // Apply critical strike if applicable
      let finalDamage = result.damage;
      gameState.player.passives.forEach(passive => {
        if (passive.effect === 'criticalChance' && Math.random() < passive.value) {
          finalDamage = Math.floor(finalDamage * passive.multiplier);
          logBattle("Critical hit!");
        }
      });
      
      // Apply damage bonuses from passives and effects
      gameState.player.passives.forEach(passive => {
        if (passive.effect === 'damageBonus') {
          finalDamage = Math.floor(finalDamage * (1 + passive.value));
        }
        
        // Berserker Blood (more damage when low health)
        if (passive.effect === 'damageBonus' && passive.condition === 'lowHealth') {
          const healthPercent = gameState.player.currentHP / gameState.player.maxHP;
          if (healthPercent <= passive.threshold) {
            finalDamage = Math.floor(finalDamage * (1 + passive.value));
          }
        }
      });
      
      // Deal damage
      gameState.enemy.takeDamage(finalDamage);
      
      // Apply life steal if applicable
      gameState.player.passives.forEach(passive => {
        if (passive.effect === 'lifeSteal') {
          const healAmount = Math.floor(finalDamage * passive.value);
          if (healAmount > 0) {
            gameState.player.heal(healAmount);
            logBattle(`${gameState.player.nickname} steals ${healAmount} life!`);
          }
        }
      });
    }
    
    // Add to battle log
    logBattle(result.log);
    
    // Remove the card from hand
    removeCardFromHand(abilityId);
    
    // Check if battle ended
    if (gameState.enemy.currentHP <= 0) {
      roundWon();
    } else {
      // Update UI
      updateUI();
    }
  }
  
  function defendAction() {
    // Check if player has enough mana
    if (!gameState.player.useMana(10)) {
      logBattle("Not enough mana to defend!");
      return;
    }
    
    // Apply defense (block 25% of next attack)
    gameState.player.block += Math.floor(gameState.player.maxHP * 0.25);
    logBattle(`${gameState.player.nickname} takes a defensive stance, blocking the next ${gameState.player.block} damage!`);
    
    // Update UI
    updateUI();
  }
  
  function replenishManaAction() {
    // Replenish all mana but end turn
    gameState.player.restoreMana(gameState.player.maxMana);
    logBattle(`${gameState.player.nickname} focuses and replenishes all mana!`);
    
    // End turn
    endTurn();
  }
  
  function endTurn() {
    // Disable buttons during enemy turn
    setButtonsEnabled(false);
    
    // Process effects at end of player turn
    processEffects(gameState.player);
    
    // Set to enemy turn
    gameState.isPlayerTurn = false;
    logBattle(`----- Turn ${gameState.turn}: Enemy's Move -----`);
    
    // Enemy acts after a short delay
    setTimeout(() => {
      // Process enemy effects
      processEffects(gameState.enemy);
      
      // Enemy performs action
      gameState.enemy.performAction();
      
      // Check if player is still alive
      if (gameState.player.currentHP > 0) {
        // Increment turn counter after both player and enemy have acted
        gameState.turn++;
        
        // Start new player turn
        startPlayerTurn();
      }
    }, 1000);
  }
  
  function startPlayerTurn() {
    // Set to player turn
    gameState.isPlayerTurn = true;
    logBattle(`----- Turn ${gameState.turn}: Your Move -----`);
    
    // Regenerate mana
    let manaRegen = 3; // Base mana regen
    
    // Apply mana regen passives
    gameState.player.passives.forEach(passive => {
      if (passive.effect === 'manaRegen') {
        manaRegen += passive.value;
      }
    });
    
    gameState.player.restoreMana(manaRegen);
    
    // Apply mana drain passives
    gameState.player.passives.forEach(passive => {
      if (passive.effect === 'manaDrain') {
        gameState.player.currentMana = Math.max(0, gameState.player.currentMana - passive.value);
        logBattle(`${gameState.player.nickname} loses ${passive.value} mana due to Mana Burn!`);
      }
    });
    
    // Apply health regen passives
    gameState.player.passives.forEach(passive => {
      if (passive.effect === 'healthRegen') {
        gameState.player.heal(passive.value);
      }
    });
    
    // Draw new hand
    drawHand();
    
    // Re-enable buttons
    setButtonsEnabled(true);
    
    updateUI();
  }
  
  function processEffects(target) {
    // Process all effects
    target.effects = target.effects.filter(effect => {
      // Reduce duration
      effect.duration--;
      
      // Apply damage over time effects
      if (effect.effect === 'damageOverTime') {
        const dotDamage = effect.value;
        if (target === gameState.player) {
          target.takeDamage(dotDamage);
          logBattle(`${target.nickname} takes ${dotDamage} damage from ${effect.name}!`);
        } else {
          target.currentHP = Math.max(0, target.currentHP - dotDamage);
          logBattle(`${target.name} takes ${dotDamage} damage from ${effect.name}!`);
          updateUI();
          
          // Check if enemy died from DOT
          if (target.currentHP <= 0) {
            roundWon();
            return false;
          }
        }
      }
      
      // Remove effect if duration is over
      return effect.duration > 0;
    });
    
    // Update effects UI
    if (target === gameState.player) {
      renderPlayerEffects();
    } else {
      renderEnemyEffects();
    }
  }
  
  function roundWon() {
    // Increment enemies defeated counter
    gameState.enemiesDefeated++;
    // Update the UI to show enemies defeated
    roundsSurvivedElem.textContent = gameState.enemiesDefeated;
    
    // Increment round for the next enemy
    gameState.round++;
    
    // Reset turn counter for new round
    gameState.turn = 1;
    
    // Award XP
    gameState.player.gainXP(gameState.enemy.xpReward);
    
    logBattle(`You defeated the ${gameState.enemy.name}!`);
    logBattle(`Gained ${gameState.enemy.xpReward} XP!`);
    logBattle(`Total enemies defeated: ${gameState.enemiesDefeated}`);
    logBattle(`=== Round ${gameState.round} ===`);
    
    // Show mutation selection
    showMutationSelection();
  }
  
  function showMutationSelection() {
    // Generate 3 random mutations
    const mutations = getRandomMutations(3);
    
    // Clear previous choices
    mutationChoicesElem.innerHTML = '';
    
    // Add mutation choices
    mutations.forEach((mutation, index) => {
      const mutationElem = document.createElement('div');
      mutationElem.className = 'mutation-choice';
      mutationElem.innerHTML = `
        <div class="mutation-choice-name">${mutation.name}</div>
        <div class="mutation-choice-description">${mutation.description}</div>
      `;
      
      // Add click handler
      mutationElem.addEventListener('click', () => selectMutation(index, mutations));
      
      mutationChoicesElem.appendChild(mutationElem);
    });
    
    // Show overlay
    mutationSelectionElem.classList.remove('hidden');
  }
  
  function selectMutation(index, mutations) {
    const selectedMutation = mutations[index];
    
    // Apply mutation effect
    const result = selectedMutation.effect(gameState.player);
    
    // Add to active mutations
    gameState.activeMutations.push({
      name: selectedMutation.name,
      description: selectedMutation.description,
      result: result
    });
    
    // Hide selection overlay
    mutationSelectionElem.classList.add('hidden');
    
    // Update mutations list
    renderMutations();
    
    // Spawn new enemy
    spawnEnemy();
    
    // Reset turn counter for new round
    gameState.turn = 1;
    
    // Start new round
    logBattle(`You encounter a ${gameState.enemy.name}!`);
    logBattle(`----- Turn ${gameState.turn}: Your Move -----`);
    
    // Start player turn
    startPlayerTurn();
  }
  
  function gameOver() {
    // Disable all buttons
    setButtonsEnabled(false);
    
    logBattle("Game Over!");
    
    // Set final stats
    finalNicknameElem.textContent = gameState.player.nickname;
    finalClassElem.textContent = gameState.player.className;
    finalRoundsElem.textContent = gameState.round;
    finalLevelElem.textContent = gameState.player.level;
    
    // Show mutation history
    finalMutationsElem.innerHTML = '';
    gameState.activeMutations.forEach(mutation => {
      const mutationElem = document.createElement('div');
      mutationElem.className = 'mutation-item';
      mutationElem.innerHTML = `
        <div class="mutation-name">${mutation.name}</div>
        <div class="mutation-description">${mutation.description}</div>
      `;
      finalMutationsElem.appendChild(mutationElem);
    });
    
    // Show game over screen
    gameOverElem.classList.remove('hidden');
    
    // Submit score to leaderboard
    submitScore(
      gameState.player.nickname,
      gameState.player.className,
      gameState.round,
      gameState.player.level
    );
  }
  
  function returnToMenu() {
    window.location.href = 'index.html';
  }
  
  // UI Functions
  function updateUI() {
    // Update top header stats - only game progress remains
    playerLevelElem.textContent = gameState.player.level;
    playerXpElem.textContent = gameState.player.xp;
    xpNeededElem.textContent = gameState.player.xpNeeded;
    xpBarElem.style.width = `${(gameState.player.xp / gameState.player.xpNeeded) * 100}%`;
    roundsSurvivedElem.textContent = gameState.round;
    
    // Update battle UI stats
    // Player stats below avatar
    document.getElementById('battle-player-name').textContent = gameState.player.nickname;
    document.getElementById('battle-player-hp').textContent = gameState.player.currentHP;
    document.getElementById('battle-player-max-hp').textContent = gameState.player.maxHP;
    document.getElementById('battle-player-mana').textContent = gameState.player.currentMana;
    document.getElementById('battle-player-max-mana').textContent = gameState.player.maxMana;
    document.getElementById('battle-player-speed').textContent = gameState.player.speed;
    document.getElementById('battle-player-hp-bar').style.width = `${(gameState.player.currentHP / gameState.player.maxHP) * 100}%`;
    document.getElementById('battle-player-mana-bar').style.width = `${(gameState.player.currentMana / gameState.player.maxMana) * 100}%`;
    
    // Enemy stats below avatar
    document.getElementById('battle-enemy-name').textContent = gameState.enemy.name;
    document.getElementById('battle-enemy-level').textContent = gameState.enemy.level;
    document.getElementById('battle-enemy-hp').textContent = gameState.enemy.currentHP;
    document.getElementById('battle-enemy-max-hp').textContent = gameState.enemy.maxHP;
    document.getElementById('battle-enemy-hp-bar').style.width = `${(gameState.enemy.currentHP / gameState.enemy.maxHP) * 100}%`;
    document.getElementById('enemy-min-damage').textContent = gameState.enemy.baseDamage[0];
    document.getElementById('enemy-max-damage').textContent = gameState.enemy.baseDamage[1];
    
    // Update effects
    renderPlayerEffects();
    renderEnemyEffects();
  }
  
  function renderPlayerAvatar() {
    playerAvatarElem.textContent = gameState.player.icon;
    playerAvatarElem.title = `${gameState.player.nickname} the ${gameState.player.className}`;
  }
  
  function renderEnemyAvatar() {
    enemyAvatarElem.textContent = gameState.enemy.icon;
    enemyAvatarElem.title = `${gameState.enemy.name} (Level ${gameState.enemy.level})`;
  }
  
  function renderPlayerEffects() {
    playerEffectsElem.innerHTML = '';
    
    gameState.player.effects.forEach(effect => {
      const effectElem = document.createElement('div');
      effectElem.className = 'effect-icon';
      effectElem.textContent = effect.icon;
      
      // Add tooltip with detailed effect information
      const tooltip = document.createElement('div');
      tooltip.className = 'effect-tooltip';
      
      const tooltipName = document.createElement('div');
      tooltipName.className = 'tooltip-name';
      tooltipName.textContent = effect.name;
      tooltip.appendChild(tooltipName);
      
      const tooltipDuration = document.createElement('div');
      tooltipDuration.className = 'tooltip-duration';
      tooltipDuration.textContent = `${effect.duration} round${effect.duration !== 1 ? 's' : ''} remaining`;
      tooltip.appendChild(tooltipDuration);
      
      const tooltipDescription = document.createElement('div');
      tooltipDescription.className = 'tooltip-description';
      
      // Generate description based on effect type
      switch(effect.effect) {
        case 'damageBonus':
          tooltipDescription.textContent = `Increases damage by ${effect.value * 100}%`;
          break;
        case 'damageReduction':
          tooltipDescription.textContent = `Reduces incoming damage by ${effect.value * 100}%`;
          break;
        case 'speedReduction':
          tooltipDescription.textContent = `Reduces speed by ${effect.value}`;
          break;
        case 'stunned':
          tooltipDescription.textContent = 'Cannot perform any actions';
          break;
        case 'damageOverTime':
          tooltipDescription.textContent = `Takes ${effect.value} damage at the end of each turn`;
          break;
        default:
          tooltipDescription.textContent = effect.name;
      }
      
      tooltip.appendChild(tooltipDescription);
      effectElem.appendChild(tooltip);
      
      playerEffectsElem.appendChild(effectElem);
    });
  }
  
  function renderEnemyEffects() {
    enemyEffectsElem.innerHTML = '';
    
    gameState.enemy.effects.forEach(effect => {
      const effectElem = document.createElement('div');
      effectElem.className = 'effect-icon';
      effectElem.textContent = effect.icon;
      
      // Add tooltip with detailed effect information
      const tooltip = document.createElement('div');
      tooltip.className = 'effect-tooltip';
      
      const tooltipName = document.createElement('div');
      tooltipName.className = 'tooltip-name';
      tooltipName.textContent = effect.name;
      tooltip.appendChild(tooltipName);
      
      const tooltipDuration = document.createElement('div');
      tooltipDuration.className = 'tooltip-duration';
      tooltipDuration.textContent = `${effect.duration} round${effect.duration !== 1 ? 's' : ''} remaining`;
      tooltip.appendChild(tooltipDuration);
      
      const tooltipDescription = document.createElement('div');
      tooltipDescription.className = 'tooltip-description';
      
      // Generate description based on effect type
      switch(effect.effect) {
        case 'damageBonus':
          tooltipDescription.textContent = `Increases damage by ${effect.value * 100}%`;
          break;
        case 'damageReduction':
          tooltipDescription.textContent = `Reduces incoming damage by ${effect.value * 100}%`;
          break;
        case 'speedReduction':
          tooltipDescription.textContent = `Reduces speed by ${effect.value}`;
          break;
        case 'stunned':
          tooltipDescription.textContent = 'Cannot perform any actions';
          break;
        case 'damageOverTime':
          tooltipDescription.textContent = `Takes ${effect.value} damage at the end of each turn`;
          break;
        default:
          tooltipDescription.textContent = effect.name;
      }
      
      tooltip.appendChild(tooltipDescription);
      effectElem.appendChild(tooltip);
      
      enemyEffectsElem.appendChild(effectElem);
    });
  }
  
  function renderMutations() {
    mutationsListElem.innerHTML = '';
    
    if (gameState.activeMutations.length === 0) {
      mutationsListElem.innerHTML = '<div class="no-mutations">No mutations yet</div>';
      return;
    }
    
    gameState.activeMutations.forEach(mutation => {
      const mutationElem = document.createElement('div');
      mutationElem.className = 'mutation-item';
      mutationElem.innerHTML = `
        <div class="mutation-name">${mutation.name}</div>
        <div class="mutation-description">${mutation.description}</div>
      `;
      mutationsListElem.appendChild(mutationElem);
    });
  }
  
  function drawHand() {
    // Clear hand
    handContainerElem.innerHTML = '';
    gameState.handCards = [];
    
    // Get hand size based on level
    const handSize = gameState.player.handSize;
    
    // Draw random cards
    const drawnCards = getRandomCards(gameState.player, handSize);
    gameState.handCards = drawnCards;
    
    // Render cards
    drawnCards.forEach(cardId => {
      const card = ABILITIES[cardId];
      
      const cardElem = document.createElement('div');
      cardElem.className = 'card';
      cardElem.dataset.cardId = cardId;
      
      // Check if card is usable (enough mana)
      if (gameState.player.currentMana < card.manaCost) {
        cardElem.classList.add('card-disabled');
      } else {
        cardElem.addEventListener('click', () => useAbility(cardId));
      }
      
      cardElem.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-cost">${card.manaCost}</div>
        <div class="card-icon">${card.icon}</div>
        <div class="card-description">${card.description}</div>
      `;
      
      handContainerElem.appendChild(cardElem);
    });
  }
  
  function removeCardFromHand(cardId) {
    // Remove from state
    gameState.handCards = gameState.handCards.filter(id => id !== cardId);
    
    // Remove from DOM
    const cardElem = document.querySelector(`.card[data-card-id="${cardId}"]`);
    if (cardElem) {
      cardElem.remove();
    }
    
    // Re-render hand with updated mana
    const cardsToUpdate = document.querySelectorAll('.card');
    cardsToUpdate.forEach(card => {
      const id = card.dataset.cardId;
      const ability = ABILITIES[id];
      
      // Check if card is usable with current mana
      if (gameState.player.currentMana < ability.manaCost) {
        card.classList.add('card-disabled');
        
        // Remove click handler
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
      } else if (card.classList.contains('card-disabled')) {
        card.classList.remove('card-disabled');
        
        // Add click handler
        card.addEventListener('click', () => useAbility(id));
      }
    });
  }
  
  function setButtonsEnabled(enabled) {
    defendButtonElem.disabled = !enabled;
    replenishButtonElem.disabled = !enabled;
    endTurnButtonElem.disabled = !enabled;
    
    // Also disable/enable cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      if (enabled) {
        const cardId = card.dataset.cardId;
        const ability = ABILITIES[cardId];
        
        if (gameState.player.currentMana >= ability.manaCost) {
          card.classList.remove('card-disabled');
          card.addEventListener('click', () => useAbility(cardId));
        }
      } else {
        card.classList.add('card-disabled');
        
        // Remove event listener by cloning
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
      }
    });
  }
  
  function logBattle(message) {
    // Add to state
    gameState.battleLog.unshift(message);
    
    // Keep only last 50 messages
    if (gameState.battleLog.length > 50) {
      gameState.battleLog.pop();
    }
    
    // Add to DOM
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = message;
    battleLogElem.insertBefore(logEntry, battleLogElem.firstChild);
    
    // Keep only last 50 visible messages
    const entries = battleLogElem.getElementsByClassName('log-entry');
    if (entries.length > 50) {
      for (let i = 50; i < entries.length; i++) {
        entries[i].remove();
      }
    }
  }
  
  // Start the game
  initGame();
});