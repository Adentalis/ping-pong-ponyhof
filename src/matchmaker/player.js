// createPlayersFromJSON : JSON -> [players]
function createPlayersFromJSON(json) {
  // players are deeply nested in the input json
  const players = json.tournament.competition.players.player;

  return players.map(createPlayer);
}

// createPlayer : playerFromJSON -> Player
function createPlayer(dataFromJSON) {
  const { id, person } = dataFromJSON;
  const { firstname, lastname, ttr } = person;
  const clubname = person["club-name"];

  return {
    id,
    firstname,
    lastname,
    clubname,
    gamesWon: 0,
    matchIds: [],
    opponentIds: [],
    qttr: parseInt(ttr, 10),
    active: true,
    hadFreeTicketAlready: false
  };
}

// pairPlayers : { top: [players], bottom: [players]} -> [{ player1: player, player2: player}]
function pairPlayersRoundOne({ top, bottom }) {
  let bottomPlayers = bottom;
  let topPlayers = top;
  let pairings = [];

  while (bottomPlayers.length !== 0) {
    const randomTopPlayer =
      topPlayers[Math.floor(Math.random() * topPlayers.length)];
    const randomBottomPlayer =
      bottomPlayers[Math.floor(Math.random() * bottomPlayers.length)];

    //remove chosen players
    topPlayers = topPlayers.filter(player => player !== randomTopPlayer);
    bottomPlayers = bottomPlayers.filter(
      player => player !== randomBottomPlayer
    );

    pairings.push({ player1: randomTopPlayer, player2: randomBottomPlayer });
  }

  // pair last player when odd number of players
  if (topPlayers[0]) {
    pairings.push({ player1: topPlayers[0] });
  }

  return pairings;
}

// separateTopFromBottomPlayers : [players] -> { top: [players], bottom: [players]}
function separateTopFromBottomPlayers(players) {
  const sortedPlayers = sortPlayersBy(players, "qttr");
  const top = sortedPlayers.slice(0, Math.ceil(sortedPlayers.length / 2));
  const bottom = sortedPlayers.slice(Math.ceil(sortedPlayers.length / 2));

  return { top, bottom };
}

// sortPlayersBy : [players] -> [players]
function sortPlayersBy(players, selector) {
  return players.sort((playerA, playerB) => {
    return playerB[selector] - playerA[selector];
  });
}

// shuffle : [a] -> [a]
function shuffle(array) {
  const TIMES = array.length;
  for (let i = 0; i < TIMES; i++) {
    const first = Math.floor(Math.random() * array.length);
    const second = Math.floor(Math.random() * array.length);
    [array[first], array[second]] = [array[second], array[first]];
  }
  return array;
}

// updatePlayers : [matches] -> [players]
function updatePlayers(matches) {
  let players = [];

  //TODO calculate winner and ++gamesWon
  for (let match of matches) {
    const player1 = {
      ...match.player1,
      opponentIds: match.player1.opponentIds.concat(match.player2.id)
    };

    const player2 = {
      ...match.player2,
      opponentIds: match.player2.opponentIds.concat(match.player1.id)
    };
    players.push(player1);
    players.push(player2);
  }

  return players;
}

module.exports = {
  // pubic
  createPlayersFromJSON,

  // private
  createPlayer,
  pairPlayersRoundOne,
  sortPlayersBy,
  separateTopFromBottomPlayers,
  shuffle,
  updatePlayers
};
