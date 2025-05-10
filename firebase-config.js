// Firebase configuration
// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "YOUR_DATABASE_URL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Leaderboard functions
function getLeaderboard(callback) {
  const leaderboardRef = database.ref('leaderboard');
  leaderboardRef.orderByChild('round').limitToLast(10).once('value', (snapshot) => {
    const leaderboard = [];
    snapshot.forEach((childSnapshot) => {
      leaderboard.push(childSnapshot.val());
    });
    // Sort in descending order by rounds and then by level
    leaderboard.sort((a, b) => {
      if (b.round !== a.round) {
        return b.round - a.round;
      }
      return b.level - a.level;
    });
    callback(leaderboard);
  });
}

function submitScore(nickname, playerClass, round, level) {
  if (!nickname) return;
  
  const scoreData = {
    nickname: nickname,
    class: playerClass,
    round: round,
    level: level,
    timestamp: Date.now()
  };
  
  database.ref('leaderboard').push(scoreData);
}