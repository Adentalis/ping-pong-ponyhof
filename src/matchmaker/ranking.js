// calculateBHZ : [players], [matches] -> [rankning]
function createCurrentRanking(players, matches) {
  let ranking = [];

  //copy call by value
  let dummyMatches = JSON.parse(JSON.stringify(matches));
  addMatchDetails(players, dummyMatches);

  players.forEach(player => {
    ranking.push({
      place: 0,
      id: player.id,
      firstname: player.firstname,
      lastname: player.lastname,
      gamesWon: player.gamesWon,
      gamesLost: player.matchIds.length - player.gamesWon,
      bhz: calculateBHZ(player, players),
      qttr: player.qttr,
      //ToDo feature - live ttr
      ttr_beginn: 1000,
      ttr_now: 1123,
      ttr_diff: 123,
      matches: getMatchesInvolved(player, dummyMatches)
    });
  });

  ranking.sort(function(p1, p2) {
    // Sort by gamesWon
    if (p1.gamesWon > p2.gamesWon) return -1;
    if (p1.gamesWon < p2.gamesWon) return 1;

    // If gamesWon is equal between two players
    // -> sort for bhz
    if (p1.bhz > p2.bhz) return -1;
    if (p1.bhz < p2.bhz) return 1;

    //TODO
    // if  bhz  is equal as well
    // -> check if they played against each other

    //if they didnt play against each other
    //-> worse qttr
  });

  //after the ranking is sorted the place can be set by the position in ranking
  for (let i = 0; i < ranking.length; i++) {
    ranking[i].place = i + 1;
  }
  return ranking;
}

// logRanking : [ranking] -> console.log(ranking)
function logRanking(ranking) {
  const round = ranking[0].matches.length;
  let log = "---------Ranking after Round " + round + " --------\n";
  log +=
    "Platz\tName\t\tS:N\tBHZ\tTTR-Start\tTTR-Aktuell\tTTR-Diff\t" +
    "|\t1.Runde\t\t2.Runde\t\t3.Runde\t\t4.Runde\t\t5.Runde\t\t6.Runde\n";

  ranking.forEach(player => {
    log +=
      player.place +
      "\t\t" +
      player.lastname.substring(0, 7) +
      "\t\t" +
      player.gamesWon +
      ":" +
      player.gamesLost +
      "\t" +
      player.bhz +
      "\t" +
      player.qttr +
      "\t\t" +
      player.ttr_now +
      "\t\t" +
      player.ttr_diff +
      "\t\t|\t";

    // create for each match a summary -> Krause 3:0
    player.matches.forEach(match => {
      if (match.player1 === player.id) {
        log += match.player2lastname + " ";
      } else {
        log += match.player1lastname + " ";
      }
      log += match.result.player1 + ":" + match.result.player2 + "\t";
    });
    log += "\n";
  });
  console.log(log);
}
// calculateBHZ : player, [matches] -> bhz
function calculateBHZ(playerToCalculate, players) {
  let bhz = 0;
  //bhz = the sum of all games your opponents you have played against have won
  players.forEach(player => {
    if (playerToCalculate.opponentIds.includes(player.id)) {
      bhz += player.gamesWon;
    }
  });
  return bhz;
}

// getMatchesInvolved : player, [matches] -> [mactchesInvolved]
function getMatchesInvolved(player, matches) {
  let mactchesInvolved = matches.filter(function(match) {
    if (match.player1 === player.id || match.player2 === player.id) return true;
    return false;
  });
  return mactchesInvolved;
}

// addMatchDetails : [players], [matches] -> [matchesWithDetail]
function addMatchDetails(players, matches) {
  matches.forEach(match => {
    match.player1firstname = getFirstNameOfPlayerId(match.player1, players);
    match.player2firstname = getFirstNameOfPlayerId(match.player2, players);
    match.player1lastname = getLastNameOfPlayerId(match.player1, players);
    match.player2lastname = getLastNameOfPlayerId(match.player2, players);
    match.result = createMatchResult(match);
  });
}

// getFirstNameOfPlayerId : playerId, [players] -> firstname
function getFirstNameOfPlayerId(playerId, players) {
  let firstname = "";
  players.forEach(player => {
    if (player.id === playerId) {
      firstname = player.firstname;
    }
  });
  return firstname;
}

// getLastNameOfPlayerId : playerId, [players] -> lastname
function getLastNameOfPlayerId(playerId, players) {
  let lastname = "";
  players.forEach(player => {
    if (player.id === playerId) {
      lastname = player.lastname;
    }
  });
  return lastname;
}

// createMatchResult : match -> JSON
function createMatchResult(match) {
  let player1SetsWon = 0;
  let player2SetsWon = 0;

  match.sets.forEach(set => {
    //player1 has more points
    if (set.player1 > set.player2) {
      player1SetsWon++;
    }
    //player2 has more points
    if (set.player1 < set.player2) {
      player2SetsWon++;
    }
  });

  return { player1: player1SetsWon, player2: player2SetsWon };
}

module.exports = { createCurrentRanking, logRanking, createMatchResult };
