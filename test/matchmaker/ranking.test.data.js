const matchWithResult_13 = {
  id: 1,
  player1: "PLAYER1",
  player2: "PLAYER2",
  sets: [
    {
      player1: 8,
      player2: 11
    },
    {
      player1: 11,
      player2: 13
    },
    {
      player1: 11,
      player2: 0
    },
    {
      player1: 4,
      player2: 11
    }
  ]
};

const matchWithResult_12 = {
  id: 1,
  player1: "PLAYER1",
  player2: "PLAYER2",
  sets: [
    {
      player1: 11,
      player2: 13
    },
    {
      player1: 11,
      player2: 5
    },
    {
      player1: 4,
      player2: 11
    }
  ]
};

const matchWithResult_10 = {
  id: 1,
  player1: "PLAYER1",
  player2: "PLAYER2",
  sets: [
    {
      player1: 11,
      player2: 2
    }
  ]
};

const matchWithWrongSets = {
  id: 1,
  player1: "PLAYER1",
  player2: "PLAYER2",
  sets: [
    {
      player1: 11,
      player2: 10
    },
    {
      player1: 2,
      player2: 2
    },
    {
      player1: 0,
      player2: 0
    },
    {
      player1: 5,
      player2: 6
    }
  ]
};

const twoPlayers = [
  {
    id: "PingPong",
    firstname: "Pony",
    lastname: "Hof",
    clubname: "Einhornhausen",
    gamesWon: 1,
    matchIds: [4, 5, 6, 7],
    opponentIds: ["PLAYER1"],
    qttr: 2020,
    active: true
  },
  {
    id: "PLAYER1",
    firstname: "Gerhard",
    lastname: "Acker",
    clubname: "ESV SF Neuaubing",
    gamesWon: 0,
    matchIds: [1, 4, 9],
    opponentIds: ["PingPong"],
    qttr: 1960,
    active: true
  }
];

const matchesToUpdate = [
  {
    id: 1,
    player1: "PingPong",
    player2: "PLAYER1",
    sets: [
      {
        player1: 11,
        player2: 0
      }
    ]
  },
  {
    id: 11,
    player1: "Player1",
    player2: "",
    sets: [
      {
        player1: 0,
        player2: 11
      }
    ]
  }
];

const dummyMatches = [
  {
    id: 1
  },
  {
    id: 2
  },
  {
    id: 3
  },
  {
    id: 4
  },
  {
    id: 5
  },
  {
    id: 6
  },
  {
    id: 7
  },
  {
    id: 8
  },
  {
    id: 9
  },
  {
    id: 10
  }
];

module.exports = {
  matchWithResult_13,
  matchWithResult_12,
  matchWithResult_10,
  matchWithWrongSets,
  twoPlayers,
  matchesToUpdate,
  dummyMatches
};
