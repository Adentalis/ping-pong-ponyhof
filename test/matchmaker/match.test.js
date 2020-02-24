const {
  createMatch,
  createMatches,
  getMatchWinner,
  simulateMatch
} = require("../../src/matchmaker/match");

const {
  testPairing,
  testPairingWithFreeTicket,
  match_init,
  match_noWinner,
  match_noWinner2,
  match_player1Wins,
  match_player1Wins2,
  match_player2Wins,
  match_player2Wins2,
  match_toSimulate,
  matchResultPlayer1Won,
  matchResultPlayer2Won
} = require("./match.test.data");

describe("createMatches()", () => {
  const matches = createMatches(testPairingWithFreeTicket);
  let matchIds = new Set();
  let players = new Set();

  matches.forEach(match => {
    matchIds.add(match.id);
    players.add(match.player1);
    players.add(match.player2);
  });

  const matchCount = matches.length;

  test("creates an array of matches from an array of pairings", () => {
    expect(matchCount).toBe(testPairingWithFreeTicket.length);
    expect(matchIds.size).toBe(matchCount);
    expect(players.size).toBe(matchCount * 2);
  });

  test("matchID for next match is ++1", () => {
    matchIds = Array.from(matchIds);
    matchIds.reduce((prev, current) => {
      expect(current).toBe(prev + 1);
      return current;
    });
  });

  test("freeTicket player exists", () => {
    expect(players).toContain("FreeTicket");
  });
});

describe("createMatch()", () => {
  const match = createMatch(testPairing[1]);

  test("creates match that has all the necessary properties", () => {
    expect(match.id).toBeDefined();
    expect(match.player1).toBeDefined();
    expect(match.player2).toBeDefined();
    expect(match.sets).toBeDefined();
  });
});

describe("getMatchWinner()", () => {
  test("get expected winner of a match", () => {
    expect(getMatchWinner(match_init)).toBe("0");
    expect(getMatchWinner(match_noWinner)).toBe("0");
    expect(getMatchWinner(match_noWinner2)).toBe("0");
    expect(getMatchWinner(match_player1Wins)).toBe("PLAYER1");
    expect(getMatchWinner(match_player1Wins2)).toBe("PLAYER1");
    expect(getMatchWinner(match_player2Wins)).toBe("PLAYER2");
    expect(getMatchWinner(match_player2Wins2)).toBe("PLAYER2");
  });
});

describe("simulateMatch()", () => {
  test("get expected match result", () => {
    const matchWithResult = simulateMatch(match_toSimulate);
    //easiest way to test if two arrays are equal to each other --> compare their strings
    expect(
      JSON.stringify(matchWithResult.sets) ==
        JSON.stringify(matchResultPlayer1Won) ||
        JSON.stringify(matchWithResult.sets) ==
          JSON.stringify(matchResultPlayer2Won)
    ).toBe(true);
    expect(getMatchWinner(matchWithResult)).not.toEqual("0");
  });
});

describe("simulateMatches()", () => {
  //init 8 matches
  let matchesToSimulate = [];
  for (let i = 0; i < 4; i++) {
    matchesToSimulate.push(match_toSimulate);
    matchesToSimulate.push(match_init);
  }
  test("get winner for each match", () => {
    matchesToSimulate.forEach(match => {
      match = simulateMatch(match);
      expect(getMatchWinner(match)).not.toEqual("0");
    });
  });
});
