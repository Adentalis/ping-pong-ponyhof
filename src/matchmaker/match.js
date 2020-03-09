const { createMatchResult, getParameterByPlayerId } = require("./ranking.js");

// createMatches : [{player1: Player, player2: Player}] -> [Match]
function createMatches(pairings, lastMatchId) {
  debugger;
  let remainingPairings = [...pairings];
  let matchId = lastMatchId > 0 ? lastMatchId++ : lastMatchId;

  let matches = [];
  while (remainingPairings.length > 0) {
    const match = createMatch(remainingPairings.shift(), matchId);
    matches.push(match);
    matchId++;
  }

  return matches;
}

// createMatch : {player1: Player, player2: Player} -> Match
function createMatch({ player1, player2 }, matchId) {
  const MAXIMUM_SETS = 5;

  const match = {
    id: matchId,
    player1: player1,
    player2: player2,
    sets: []
  };

  for (let i = 0; i < MAXIMUM_SETS; i++) {
    match.sets.push({
      player1: 0,
      player2: 0
    });
  }

  if (player2 === "FreeTicket") {
    for (let i = 0; i < Math.ceil(MAXIMUM_SETS / 2); i++) {
      match.sets[i].player1 = 11;
    }
  }
  return match;
}

// this function will just be used in our tests
// simulateMatches : [matches] -> [matches]
function simulateMatches(matches) {
  matches.forEach(match => {
    simulateMatch(match);
  });
  return matches;
}

// simulateMatch : match -> match
function simulateMatch(match) {
  //create possible results
  const player1Wins = [
    {
      player1: 11,
      player2: 1
    },
    {
      player1: 11,
      player2: 2
    },
    {
      player1: 11,
      player2: 3
    }
  ];

  const player2Wins = [
    {
      player1: 4,
      player2: 11
    },
    {
      player1: 5,
      player2: 11
    },
    {
      player1: 6,
      player2: 11
    }
  ];

  if (match.player1 === "FreeTicket") {
    match.sets = player2Wins;
  } else if (match.player2 === "FreeTicket") {
    match.sets = player1Wins;
  } else {
    //no freeticket player in match -> random player wins
    match.sets = Math.random() < 0.5 ? player1Wins : player2Wins;
  }

  return match;
}

// getMatchWinner : match -> id
// id = id of playerWon or if noone has won so far id = "0"
function getMatchWinner(match) {
  let player1SetsWon = 0;
  let player2SetsWon = 0;

  match.sets.forEach(set => {
    //player1 has more points
    if (set.player1 - 1 > set.player2) {
      player1SetsWon++;
    }
    //player2 has more points
    if (set.player1 < set.player2 - 1) {
      player2SetsWon++;
    }
  });

  if (player1SetsWon === 3) return match.player1;

  if (player2SetsWon === 3) return match.player2;

  return "0";
}

function logMatches(matches, players) {
  let log = "";
  matches.forEach(match => {
    const res = createMatchResult(match);
    log +=
      "(" +
      getParameterByPlayerId(match.player1, players, "gamesWon") +
      ")" +
      getParameterByPlayerId(match.player1, players, "lastname") +
      " - " +
      "(" +
      getParameterByPlayerId(match.player2, players, "gamesWon") +
      ")" +
      getParameterByPlayerId(match.player2, players, "lastname") +
      " " +
      res.player1 +
      ":" +
      res.player2 +
      "\n";
  });
  console.log(log);
}

module.exports = {
  createMatch,
  createMatches,
  simulateMatches,
  simulateMatch,
  getMatchWinner,
  logMatches
};
