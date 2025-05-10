// Global variable for selected class
let selectedClass = null;

// Handle class selection (called from inline onclick in HTML)
function handleClassSelection(card, classType) {
  // Remove selected class from all cards
  const allCards = document.querySelectorAll('.class-card');
  allCards.forEach(c => c.classList.remove('selected'));
  
  // Add selected class to clicked card
  card.classList.add('selected');
  
  // Update selected class
  selectedClass = classType;
  
  // Validate inputs
  const nicknameInput = document.getElementById('nickname');
  const startGameButton = document.getElementById('start-game');
  const nickname = nicknameInput.value.trim();
  
  // Enable start button if both nickname and class are selected
  if (nickname && nickname.length >= 3 && selectedClass) {
    startGameButton.disabled = false;
  }
  
  console.log("Selected class:", selectedClass); // Debug info
}

// Global startGame function to be called from the button
function startGame() {
  const nicknameInput = document.getElementById('nickname');
  const nickname = nicknameInput.value.trim();
  
  console.log("Starting game with nickname:", nickname, "and class:", selectedClass);
  
  if (!nickname || !selectedClass) {
    alert("Please enter a nickname and select a class before starting.");
    return;
  }
  
  // Save player data to localStorage for game.js to access
  const playerData = {
    nickname: nickname,
    class: selectedClass
  };
  
  console.log("Saving player data:", playerData);
  localStorage.setItem('arkaniumPlayer', JSON.stringify(playerData));
  
  // Try different approaches to navigate to game.html
  try {
    console.log("Navigating to game.html");
    window.location.href = 'game.html';
    
    // Additional fallback if the above doesn't trigger navigation
    setTimeout(function() {
      console.log("Fallback navigation");
      document.location.href = 'game.html';
    }, 500);
  } catch (e) {
    console.error("Navigation error:", e);
    alert("Error starting the game. Please try again.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const nicknameInput = document.getElementById('nickname');
  const nicknameError = document.getElementById('nickname-error');
  const classCards = document.querySelectorAll('.class-card');
  const startGameButton = document.getElementById('start-game');
  const leaderboardBody = document.getElementById('leaderboard-body');
  
  // Load leaderboard
  function loadLeaderboard() {
    leaderboardBody.innerHTML = '<tr><td colspan="5">Loading leaderboard...</td></tr>';
    
    getLeaderboard((leaderboard) => {
      if (leaderboard.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="5">No scores yet. Be the first!</td></tr>';
        return;
      }
      
      leaderboardBody.innerHTML = '';
      leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${entry.nickname}</td>
          <td>${entry.class}</td>
          <td>${entry.round}</td>
          <td>${entry.level}</td>
        `;
        leaderboardBody.appendChild(row);
      });
    });
  }
  
  // Initialize
  loadLeaderboard();
  
  // Event Listeners
  nicknameInput.addEventListener('input', validateInputs);
  
  // We're using the onclick attribute now, but adding this as a fallback
  startGameButton.addEventListener('click', function() {
    startGame();
  });
  
  // Functions
  function validateInputs() {
    const nickname = nicknameInput.value.trim();
    
    if (!nickname) {
      nicknameError.textContent = 'Nickname is required';
      startGameButton.disabled = true;
      return;
    }
    
    if (nickname.length < 3) {
      nicknameError.textContent = 'Nickname must be at least 3 characters';
      startGameButton.disabled = true;
      return;
    }
    
    nicknameError.textContent = '';
    
    // Enable start button if both nickname and class are selected
    console.log("Validating inputs - Nickname:", nickname, "Selected class:", selectedClass);
    startGameButton.disabled = !(nickname && selectedClass);
  }
});