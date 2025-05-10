document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const nicknameInput = document.getElementById('nickname');
  const nicknameError = document.getElementById('nickname-error');
  const classCards = document.querySelectorAll('.class-card');
  const startGameButton = document.getElementById('start-game');
  const leaderboardBody = document.getElementById('leaderboard-body');
  
  // State variables
  let selectedClass = null;
  
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
  
  classCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove selected class from all cards
      classCards.forEach(c => c.classList.remove('selected'));
      
      // Add selected class to clicked card
      card.classList.add('selected');
      
      // Update selected class
      selectedClass = card.getAttribute('data-class');
      
      // Validate inputs
      validateInputs();
    });
  });
  
  startGameButton.addEventListener('click', startGame);
  
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
    startGameButton.disabled = !(nickname && selectedClass);
  }
  
  function startGame() {
    const nickname = nicknameInput.value.trim();
    
    if (!nickname || !selectedClass) {
      return;
    }
    
    // Save player data to localStorage for game.js to access
    const playerData = {
      nickname: nickname,
      class: selectedClass
    };
    
    localStorage.setItem('arkaniumPlayer', JSON.stringify(playerData));
    
    // Navigate to game.html
    window.location.href = 'game.html';
  }
});