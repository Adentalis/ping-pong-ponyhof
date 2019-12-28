// TODO: use hash?
let matchId = 0;

function createMatches({ pairings }) {
  let remainingPairings = pairings;

  let matches = [];
  while (remainingPairings) {
    const match = createMatch(remainingPairings.shift());
    matches.push(match);
  }

  return matches;
}

// todo: pass round and matchId
// createMatch : {player1: Player, player2: Player} -> Match
function createMatch({ player1, player2 }) {
  const currentMatchId = matchId;
  matchId++;

  // early return when no second player
  if (!player2) {
    const freeTicketMatch = {
      id: currentMatchId,
      player1: { ...player1, matchIds: player1.matchIds.concat(matchId) },
      result: [],
      sets: [],
      freeTicket: true
    };
    matchId++;
    return freeTicketMatch;
  }

  const match = {
    id: currentMatchId,
    player1: { ...player1, matchIds: player1.matchIds.concat(matchId) },
    player2: { ...player2, matchIds: player2.matchIds.concat(matchId) },
    result: [],
    sets: [],
    freeTicket: false
  };

  return match;
}

module.exports = {
  createMatch,
  createMatches
};
