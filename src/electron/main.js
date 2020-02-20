/**
 * @author Marco Goebel
 */

const { app, ipcMain, Menu } = require("electron");
const path = require("path");

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "../node_modules/.bin/electron")
});

const config = require("./config");
const uiActions = require("./actions/uiActions");
const menu = require("./menu/main-menu");
const ipcChannels = require("../shared/ipc/ipcChannels");
const createWindow = require("./window");

// server dependencies
const server = require("../modules/server");

// import
const { readTournamentXMLFileFromDisk } = require("../modules/import/xml-import");

// persistence
const file_manager = require("../modules/persistance/file-manager");
const file_storage = require("../modules/persistance/lowdb/file-storage");
const competition_storage = require("../modules/persistance/lowdb/competition-storage");

// models
const { createCompetitionFromJSON } = require("../modules/models/competition");
const { createPlayersFromJSON } = require("../matchmaker/player");

// matchmaker
const matchmaker = require("../matchmaker/drawing");

let mainWindow = null;
let statisticWindow = null;

let currentMatches = [];
let players = [];

const SKIP_FILE_CREATION = false;

/**
 *  init react dev tools for electron
 *  @author Felix Breitenbach
 */
function initDevTools() {
  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS
  } = require("electron-devtools-installer");

  installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log("An error occurred: ", err));
}

app.on("ready", () => {
  initDevTools();

  // init competition database
  const filePath = file_manager.getCompetitionDatabasePath();
  file_storage.open(filePath);

  // init http express server
  server.setupHTTPServer(config.SERVER_PORT);
  server.setupSocketIO();

  // create the browser window ...
  createWindow();

  // set custom application menu
  Menu.setApplicationMenu(menu);
});

app.on("before-quit", () => {
  server.shutdownServer();
});

app.on("window-all-closed", () => {
   // On macOS it is common for applications and their menu bar
   // to stay active until the user quits explicitly with Cmd + Q
   if (process.platform !== "darwin") {
     app.quit();
  }
});

app.on('activate', (event, hasVisibleWindows) => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!hasVisibleWindows) { createWindow(); }
});

ipcMain.on(ipcChannels.START_ROUND, () => {
  server.sendStartRoundBroadcast();
});

ipcMain.on(ipcChannels.OPEN_IMPORT_DIALOG, event => {
  uiActions.openXMLFile().then((xmlFilePath) => {
    event.sender.send(ipcChannels.OPEN_IMPORT_DIALOG_SUCCESS, { xmlFilePath: xmlFilePath })
  });
});

ipcMain.on(ipcChannels.IMPORT_XML_FILE, (event, args) => {
  try {
    const { xmlFilePath } = args;

    if (!xmlFilePath) {
      throw new Error('xml is not set');
    }

    // read xml file from disk and convert it to json
    const jsonObject = readTournamentXMLFileFromDisk(xmlFilePath);
    const competition = createCompetitionFromJSON(jsonObject.tournament);

    // check if file already exists
    const filepath = file_manager.getCompetitionFilePath(competition.id);
    if (file_manager.checkIfFilesExists(filepath)) {
      console.log("Competition does already exist");
      throw new Error("Das Spiel existiert bereits!");
    }

    // save tournament as json file
    if(!SKIP_FILE_CREATION) {
      file_manager.createTournamentJSONFile(filepath, jsonObject);
      file_storage.createCompetition(competition);
    }

    // use matchmaker to draw first round
    console.log("Matchmaker draw matches");
    players = createPlayersFromJSON(jsonObject);
    currentMatches = matchmaker.drawRound(players);

    // set first set to zero
    currentMatches.forEach(match => {
      match.sets.push({player1: 0, player2: 0});
      match.sets.push({player1: 0, player2: 0});
    });

    // set matches to tables
    server.setMatchesToTables(currentMatches);

    // save matches into tournament file
    if(!SKIP_FILE_CREATION) {
      const filePath = file_manager.getCompetitionFilePath(competition.id);
      competition_storage.open(filePath);
      competition_storage.createMatches(currentMatches);
    }

    console.log('Ready to play');

    // notify react app that import is ready and was successful
    event.sender.send(ipcChannels.IMPORT_XML_FILE_SUCCESS, { competitionId: competition.id, message: "success" });
  } catch (err) {
    // notify react app that a error has happend
    event.sender.send(ipcChannels.IMPORT_XML_FILE_SUCCESS, { competitionId: '', message: err.message })
  }
});

ipcMain.on(ipcChannels.GET_ALL_COMPETITIONS, event => {
  const competitions = file_storage.getAllCompetitions();
  console.log("Retrieved competitions from database", competitions.length);

  event.sender.send(ipcChannels.GET_ALL_COMPETITIONS, {
    competitions: competitions
  });
});

ipcMain.on(ipcChannels.DELETE_COMPETITION, (event, data) => {
  const { id } = data;

  file_manager.deleteTournamentJSONFile(id);
  file_storage.deleteCompetition(id);

  event.sender.send(ipcChannels.DELETE_COMPETITION);
});

ipcMain.on(ipcChannels.GET_MATCHES_BY_COMPETITON_ID, (event, args) => {
  const { id } = args;

  if (currentMatches.length === 0) {
    const filePath = file_manager.getCompetitionFilePath(id);
    competition_storage.open(filePath);
    currentMatches = competition_storage.getMatchesBy();

    // set first set to zero
    currentMatches.forEach(match => {
      match.sets.push({player1: 0, player2: 0});
      match.sets.push({player1: 0, player2: 0});
    });

    // set matches to tables
    server.setMatchesToTables(currentMatches);

    console.log('Ready to play');
  }

  event.sender.send(ipcChannels.GET_MATCHES_BY_COMPETITON_ID, { matches: currentMatches })
});

ipcMain.on(ipcChannels.OPEN_NEW_WINDOW, (event, args) => {
  const { route } = args;
  createWindow(route);
});
