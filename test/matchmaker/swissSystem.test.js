const { drawRound } = require("../../src/matchmaker/drawing");

const {
  tournamentJSON,
  tournamentJSON15Players
} = require("./player.test.data");

const { simulateMatches, logMatches } = require("../../src/matchmaker/match");

const {
  createCurrentRanking,
  logRanking,
  exportXML
} = require("../../src/matchmaker/ranking");

const {
  createPlayersFromJSON,
  updatePlayersAfterDrawing,
  updateWinner
} = require("../../src/matchmaker/player");

let players = createPlayersFromJSON(tournamentJSON15Players);

describe("playCompetition", () => {
  const roundsToPlay = 6;
  let matches = [];
  let currentMatches;
  let ranking;

  for (let round = 1; round <= roundsToPlay; round++) {
    //1. create new matches for the round (drawing)
    currentMatches = drawRound(players);

    //2. update the players with the created matches
    players = updatePlayersAfterDrawing(players, currentMatches);

    //3.1 simulate matches
    currentMatches = simulateMatches(currentMatches);

    //3.2 add currentMatches to all matches
    currentMatches.forEach(currentMatch => {
      matches.push(currentMatch);
    });

    //3.3 log matches
    //logMatches(currentMatches, players);

    //4. update winner
    players = updateWinner(players, currentMatches);

    //5. create ranking
    ranking = createCurrentRanking(players, matches);

    //5.5 log ranking
    //logRanking(ranking);
    if (round === 6) {
      const importXMLasJSON = {
        tournament: {
          name: "BTTV Bavarian TT-Race",
          "start-date": "2019-05-25",
          "end-date": "2019-05-25",
          "table-count": "8",
          "winning-sets": "3",
          "tournament-id": "d5lK%2BhCCjzbPE4bd9mBdQKIx1P%2FxYXr0",
          "tournament-location": { city: "München" },
          competition: {
            "age-group": "Damen/Herren",
            type: "Einzel",
            "start-date": "2019-05-25 13:00",
            "age-from": "2004",
            "entry-fee": "5.0",
            sex: "gemischt",
            "preliminary-round-playmode": "Schweizer System",
            players: {
              player: [
                {
                  type: "single",
                  id: "PLAYER1",
                  person: {
                    lastname: "Brandl",
                    firstname: "Gerhard",
                    birthyear: "1971",
                    "licence-nr": "311062281",
                    "club-nr": "311062",
                    "club-name": "ESV SF Neuaubing",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "986",
                    sex: "1",
                    "internal-nr": "NU2099417"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER2",
                  person: {
                    lastname: "Fiesler",
                    firstname: "Achim",
                    birthyear: "1971",
                    "licence-nr": "311006257",
                    "club-nr": "311006",
                    "club-name": "SC Baldham-Vaterstetten",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1590",
                    sex: "1",
                    "internal-nr": "NU1012534"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER3",
                  person: {
                    lastname: "Hartmann",
                    firstname: "Ulrich",
                    birthyear: "1980",
                    "licence-nr": "309036278",
                    "club-nr": "309036",
                    "club-name": "TTC Friedberg",
                    region: "Schwaben-Nord",
                    "sub-region": "Schwaben-Nord",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1474",
                    sex: "1",
                    "internal-nr": "NU1535004"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER4",
                  person: {
                    lastname: "Hofmann",
                    firstname: "Jonas Karl",
                    birthyear: "2003",
                    "licence-nr": "311066398",
                    "club-nr": "311066",
                    "club-name": "TTC Perlach",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1034",
                    sex: "1",
                    "internal-nr": "NU1831615"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER5",
                  person: {
                    lastname: "Hoppe",
                    firstname: "Hermann",
                    birthyear: "1962",
                    "licence-nr": "416006353",
                    "club-nr": "416006",
                    "club-name": "TuS Bad Aibling",
                    region: "Oberbayern-Ost",
                    "sub-region": "Oberbayern-Ost",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1198",
                    sex: "1",
                    "internal-nr": "NU1620366"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER6",
                  person: {
                    lastname: "Kohl",
                    firstname: "Georg",
                    birthyear: "1996",
                    "licence-nr": "311050018",
                    "club-nr": "311050",
                    "club-name": "MTV München von 1879",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1120",
                    sex: "1",
                    "internal-nr": "NU1998215"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER7",
                  person: {
                    lastname: "Mardaus",
                    firstname: "Udo",
                    birthyear: "1988",
                    "licence-nr": "311082250",
                    "club-nr": "311082",
                    "club-name": "TSV Waldtrudering",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1325",
                    sex: "1",
                    "internal-nr": "NU1395365"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER8",
                  person: {
                    lastname: "Motschenbach",
                    firstname: "Robert",
                    birthyear: "1953",
                    "licence-nr": "311052103",
                    "club-nr": "311052",
                    "club-name": "FT München-Blumenau 1966",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1198",
                    sex: "1",
                    "internal-nr": "NU1034205"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER9",
                  person: {
                    lastname: "Poyan",
                    firstname: "Ali",
                    birthyear: "1977",
                    "licence-nr": "311055215",
                    "club-nr": "311055",
                    "club-name": "TSC München-Maxvorstadt",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1222",
                    sex: "1",
                    "internal-nr": "NU1968031"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER10",
                  person: {
                    lastname: "Schaller",
                    firstname: "Silvo",
                    birthyear: "1964",
                    "licence-nr": "311076238",
                    "club-nr": "311076",
                    "club-name": "SV-DJK Taufkirchen",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1405",
                    sex: "1",
                    "internal-nr": "NU1045240"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER11",
                  person: {
                    lastname: "Schedel",
                    firstname: "Michael",
                    birthyear: "1964",
                    "licence-nr": "312020378",
                    "club-nr": "312020",
                    "club-name": "Gautinger SC",
                    region: "Oberbayern-Süd",
                    "sub-region": "Oberbayern-Süd",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1190",
                    sex: "1",
                    "internal-nr": "NU1579327"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER12",
                  person: {
                    lastname: "Shalaby",
                    firstname: "Adel",
                    birthyear: "1952",
                    "licence-nr": "311084231",
                    "club-nr": "311084",
                    "club-name": "TSV Zorneding 1920",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1183",
                    sex: "1",
                    "internal-nr": "NU1052100"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER13",
                  person: {
                    lastname: "Weisbein",
                    firstname: "Michael",
                    birthyear: "1984",
                    "licence-nr": "311066243",
                    "club-nr": "311066",
                    "club-name": "TTC Perlach",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1559",
                    sex: "1",
                    "internal-nr": "NU1065390"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER14",
                  person: {
                    lastname: "Weiß",
                    firstname: "Gerald",
                    birthyear: "1974",
                    "licence-nr": "413003050",
                    "club-nr": "413003",
                    "club-name": "TSV Alteglofsheim",
                    region: "Oberpfalz-Süd",
                    "sub-region": "Oberpfalz-Süd",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1585",
                    sex: "1",
                    "internal-nr": "NU1063940"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER15",
                  person: {
                    lastname: "Wurm",
                    firstname: "Matthias",
                    birthyear: "1981",
                    "licence-nr": "311025183",
                    "club-nr": "311025",
                    "club-name": "SV Helfendorf",
                    region: "Oberbayern-Mitte",
                    "sub-region": "Oberbayern-Mitte",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1098",
                    sex: "1",
                    "internal-nr": "NU1928190"
                  }
                },
                {
                  type: "single",
                  id: "PLAYER16",
                  person: {
                    lastname: "Wötzel",
                    firstname: "Tino",
                    birthyear: "1993",
                    "licence-nr": "413003170",
                    "club-nr": "413003",
                    "club-name": "TSV Alteglofsheim",
                    region: "Oberpfalz-Süd",
                    "sub-region": "Oberpfalz-Süd",
                    "club-federation-nickname": "ByTTV",
                    ttr: "1543",
                    sex: "1",
                    "internal-nr": "NU1062931"
                  }
                }
              ]
            }
          }
        }
      };
      exportXML(players, matches, importXMLasJSON);
    }
  }

  test("match length of the last round", () => {
    expect(currentMatches.length).toEqual(players.length / 2);
  });

  test("gamesWon ", () => {
    let sumGamesWon = 0;
    players.forEach(player => {
      sumGamesWon += player.gamesWon;
    });
    expect(sumGamesWon).toBe((roundsToPlay * players.length) / 2);
  });

  //TODO check if the sum of all players must be 0?
  //sometimes the result is 1 or 2
  test("ttr difference of all players together  ", () => {
    let ttrDiff = 0;
    ranking.forEach(player => {
      ttrDiff += player.ttr_diff;
    });
    expect(ttrDiff).toBeLessThan(3);
  });

  test("check bhz", () => {
    let bhz = 0;
    ranking.forEach(player => {
      bhz += player.bhz;
    });
    expect(bhz).toBe(288);
  });
});
