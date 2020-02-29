/**
 * @author Marco Goebel
 */

const fs = require("fs");
const path = require("path");

const config = require("../config");

const competitionStorage = require("../../src/modules/persistance/lowdb/competition-storage");

const COMP_ERROR_MESSAGES = competitionStorage.COMP_ERROR_MESSAGES;

afterEach(() => {
    competitionStorage.close();
});

describe("openStorage()", () => {
    test("When_FilePathIsUndefined_Expect_FilePathIsNotDefinedException", () => {
        // ARRANGE: set input values
        const filePath = null;
        const useInMemory = false;

        // ASSERT
        expect(() => {
            competitionStorage.openStorage(filePath, useInMemory)
        }).toThrow(COMP_ERROR_MESSAGES.FilePathIsUndefinedException);
    });
});

describe("initStateWithDefaults()", () => {
    test("When_StorageIsEmpty_Expect_DefaultsAreInitialized", () => {
        // ARRANGE
        const filePath = null;
        const useInMemory = true;
        const jsonObject = readJSONObjectFromDisk(config.JSON_FILE);
        const expectedState = readJSONObjectFromDisk(config.JSON_FILE_WITH_DEFAULTS);

        // ACT
        competitionStorage.openStorage(filePath, useInMemory);
        competitionStorage.initStateWithDefaults(jsonObject);

        // ASSERT
        const actualState = competitionStorage.getState();
        expect(actualState).toEqual(expectedState);
    });
});

describe("createMatches()", () => {
    test("When_NoMatchesFlagExist_Expect_AddFlagWithData", () => {
        // ARRANGE
        const filePath = null;
        const useInMemory = true;

        // test data
        const matches = [
            {
                id: 1,
                player1: "PLAYER1",
                player2: "PLAYER2",
                sets: []
            },
            {
                id: 2,
                player1: "PLAYER3",
                player2: "PLAYER4",
                sets: []
            }
            ];

        // expected result
        const expectedState = { matches: matches };

        // ACT
        competitionStorage.openStorage(filePath, useInMemory);
        competitionStorage.createMatches(matches);

        // ASSERT
        const actualState = competitionStorage.getState();
        expect(actualState).toEqual(expectedState);
    });

    test("When_MatchFlagExists_Expect_AddMatchesToCollection", () => {
        // ARRANGE
        const filePath = null;
        const useInMemory = true;

        // test data
        const initMatches = [
            {
                id: 1,
                player1: "PLAYER1",
                player2: "PLAYER2",
                sets: []
            },
            {
                id: 2,
                player1: "PLAYER3",
                player2: "PLAYER4",
                sets: []
            }
        ];
        const newMatches = [
            {
                id: 3,
                player1: "PLAYER1",
                player2: "PLAYER2",
                sets: []
            },
            {
                id: 4,
                player1: "PLAYER3",
                player2: "PLAYER4",
                sets: []
            }
        ];
        const mergedMatches = initMatches.concat(newMatches);

        // expected result
        const expectedState = { matches: mergedMatches };

        // create database with test data
        competitionStorage.openStorage(filePath, useInMemory);
        competitionStorage.createMatches(initMatches);

        // ACT
        competitionStorage.createMatches(newMatches);

        // ASSERT
        const actualState = competitionStorage.getState();
        expect(actualState).toEqual(expectedState);
    });
});

function readJSONObjectFromDisk(relativePath) {
    // Read json data from file
    const filePath = path.join(__dirname, relativePath);
    return JSON.parse(fs.readFileSync(filePath).toString());
}