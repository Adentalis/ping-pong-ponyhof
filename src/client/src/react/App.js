/**
 * @author Felix Breitenbach
 */
import React, { useReducer } from "react";
import "./App.css";
import { isMatchFinished } from "../shared/lib";

// import shared
import io from "socket.io-client";
import socketIOMessages from "../shared/socketIOMessages";

// COMPONENTS
import LoginView from "./views/LoginView";
import WaitingView from "./views/WaitingView";
import MatchView from "./views/MatchView";
import NextPlayersView from "./views/NextPlayersView";
import ConnectionStatus from "./components/ConnectionStatus";

let socket;
const isDev = true;

const VIEW = {
  LOGIN: "login",
  WAITING: "waiting",
  MATCH: "match",
  NEXT_PLAYERS: "next-players"
};

const ACTION_TYPE = {
  // ----- connection
  LOGGED_IN: "logged-in",
  LOG_OUT_REQUESTED: "log-out-request",
  LOGGED_OUT: "logged-out",
  TABLES_AVAILABLE: "tables-available",

  // ----- rounds
  ROUND_CANCELED: "round-canceled",
  ROUND_STARTED: "round-started",
  ROUND_AVAILABLE: "round-available",

  // ----- competition
  COMPETITION_CANCELED: "competition-canceled",

  // ----- sets
  SETS_UPDATED: "sets-updated",
  ADD_SET: "add-set",
  UPDATE_SETS_RESPONSE: "update-sets-response"
};

const initialState = {
  view: VIEW.LOGIN,
  isConnected: false,
  availableTables: [],
  match: undefined,
  confirmedTableNumber: -1,
  message: "",
  roundStarted: false
};

/**
 * Updates the application state
 * @param {State} state The previous state
 * @param {ActionType} action Action that was triggered
 * @returns {State} New state according to the action that happend.
 */
const reducer = (state, action) => {
  // ignore server messages when not logged in
  if (isNotLoggedIn(state, action)) {
    return state;
  }

  switch (action.type) {
    // ----- connection

    case ACTION_TYPE.LOGGED_IN:
      return handleLoggedIn(state, action);

    case ACTION_TYPE.LOG_OUT_REQUESTED:
      return switchToWaiting(state, "Ausloggen...");

    case ACTION_TYPE.LOGGED_OUT:
      return {
        ...state,
        view: VIEW.LOGIN,
        availableTables: action.availableTables
      };

    case ACTION_TYPE.TABLES_AVAILABLE:
      return {
        ...state,
        availableTables: action.availableTables
      };

    // ----- rounds

    case ACTION_TYPE.ROUND_CANCELED:
      return switchToWaiting(state, "Runde abgebrochen, kleinen Moment bitte!");

    case ACTION_TYPE.ROUND_STARTED:
      return handleRoundStarted(state, action);

    case ACTION_TYPE.ROUND_AVAILABLE:
      return handleRoundAvailable(state, action);

    // ----- competition

    case ACTION_TYPE.COMPETITION_CANCELED:
      return switchToWaiting(
        state,
        "Turnier abgebrochen, kleinen Moment bitte!"
      );

    // ----- sets

    case ACTION_TYPE.UPDATE_SETS_RESPONSE:
      return updateSetsResponse(state, action);

    case ACTION_TYPE.SETS_UPDATED:
      return { ...state, match: { ...state.match, sets: action.sets } };

    case ACTION_TYPE.ADD_SET:
      const newSet = { player1: 0, player2: 0 };
      return {
        ...state,
        match: { ...state.match, sets: [...state.match.sets, newSet] }
      };

    default:
      return state;
  }
};

function handleLoggedIn(state, action) {
  const { match, roundStarted, message, tableNumber } = action.data;

  // if there is a message, an error occured during log in
  if (message) {
    console.error(message);
    return { ...state, message };
  }

  const newState = {
    ...state,
    isConnected: !message,
    roundStarted,
    message,
    confirmedTableNumber: tableNumber
  };

  // if match already finished, show WAITING view
  if (match && isMatchFinished(match)) {
    log("Spiel beendet.");
    return {
      ...newState,
      match: filterAllUnplayedSetsExceptOne(match),
      message: "Spiel beendet. Warten auf die nächste Runde.",
      view: VIEW.WAITING
    };
  }

  // if match available and round is started, show MATCH view
  if (match && roundStarted) {
    log("Runde gestarted.");
    return {
      ...newState,
      match: filterAllUnplayedSetsExceptOne(match),
      view: VIEW.MATCH
    };
  }

  // if match available and round not started, show NEXT_PLAYERS view
  if (match) {
    log("Runde verfügbar");
    return {
      ...newState,
      match: filterAllUnplayedSetsExceptOne(match),
      view: VIEW.NEXT_PLAYERS
    };
  }

  // otherwise show WAITING view
  return {
    ...newState,
    message: "Kein laufendes Turnier.",
    view: VIEW.WAITING
  };
}

function switchToWaiting(state, message) {
  return {
    ...state,
    match: undefined,
    roundStarted: false,
    message,
    view: VIEW.WAITING
  };
}

function isNotLoggedIn(state, action) {
  return (
    state.view === VIEW.LOGIN &&
    action.type !== ACTION_TYPE.LOGGED_IN &&
    action.type !== ACTION_TYPE.TABLES_AVAILABLE
  );
}

function updateSetsResponse(state, action) {
  if (action.message === "success") {
    log("Sets successfully sent");
    return state;
  }

  if (action.message === "finished") {
    log("Sets successfully sent. Match is finished.");
    return switchToWaiting(state, "Spiel beendet. Demnächst geht es weiter.");
  }

  log("Could not send sets");
  return { ...state, message: action.message };
}

function handleRoundStarted(state, action) {
  if (!action.matchesWithPlayers) {
    return { ...state, view: VIEW.MATCH };
  }

  const newState = handleRoundAvailable(state, action);

  // don't sow matches, that are already finished
  if (isMatchFinished(newState.match)) {
    return switchToWaiting(state, "Spiel beendet. Demnächst geht es weiter.");
  }

  return { ...newState, view: VIEW.MATCH };
}

function handleRoundAvailable(state, action) {
  const matchForTable = action.matchesWithPlayers.find(
    match => match.tableNumber === state.confirmedTableNumber
  );

  if (matchForTable) {
    return {
      ...state,
      match: filterAllUnplayedSetsExceptOne(matchForTable.match),
      view: VIEW.NEXT_PLAYERS,
      message: ""
    };
  }

  console.error(
    `Runde konnte nicht gestartet werden: kein Spiel für Tisch mit der Nummber ${state.tableNumber}`
  );

  return state;
}

//
//
// ----- APP COMPONENT
//
//

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const sendTableNumber = tableNumber => event => {
    event.preventDefault();
    log("CLIENT->SERVER: LOGIN_REQUEST");
    socket.emit(socketIOMessages.LOGIN_REQUEST, { tableNumber });
  };

  const sendSets = match => event => {
    event.preventDefault();

    const requestData = {
      sets: padSetArrayWithEmptySets(match.sets),
      finished: isMatchFinished(match),
      tableNumber: state.confirmedTableNumber
    };

    log("CLIENT->SERVER: UPDATE_SETS_REQUEST");
    socket.emit(socketIOMessages.UPDATE_SETS_REQUEST, requestData);
  };

  const updateSets = match => player => setIndex => event => {
    const newSets = match.sets.map((set, index) => {
      if (setIndex === index) {
        set[player] = Number(event.target.value);
        return set;
      }
      return set;
    });

    dispatch({ type: ACTION_TYPE.SETS_UPDATED, sets: newSets });
  };

  const addSet = event => {
    sendSets(state.match)(event);
    dispatch({ type: ACTION_TYPE.ADD_SET });
  };

  const logOut = event => {
    event.preventDefault();

    log("CLIENT->SERVER: LOGOUT_REQUEST");
    socket.emit(socketIOMessages.LOGOUT_REQUEST);
    dispatch({ type: ACTION_TYPE.LOG_OUT_REQUESTED });
  };

  //
  //
  // ----- SOCKETS
  //
  //

  // register sockets for client - server communication
  if (!socket) {
    const base_url = getServerURL();
    const connection = io(base_url);

    connection.on(socketIOMessages.AVAILABLE_TABLES, tables => {
      log("SERVER->CLIENT: AVAILABLE_TABLES");

      dispatch({ type: ACTION_TYPE.TABLES_AVAILABLE, availableTables: tables });
    });

    connection.on(socketIOMessages.LOGIN_RESPONSE, data => {
      log("SERVER->CLIENT: LOGIN_RESPONSE");

      dispatch({ type: ACTION_TYPE.LOGGED_IN, data });
    });

    connection.on(socketIOMessages.LOGOUT_RESPONSE, tables => {
      log("SERVER->CLIENT: LOGOUT_RESPONSE");

      dispatch({ type: ACTION_TYPE.LOGGED_OUT, availableTables: tables });
    });

    connection.on(socketIOMessages.NEXT_ROUND, data => {
      log("SERVER->CLIENT: NEXT_ROUND");

      dispatch({
        type: ACTION_TYPE.ROUND_AVAILABLE,
        matchesWithPlayers: data.matchesWithPlayers
      });
    });

    connection.on(socketIOMessages.START_ROUND, data => {
      log("SERVER->CLIENT: START_ROUND");

      data
        ? dispatch({
            type: ACTION_TYPE.ROUND_STARTED,
            matchesWithPlayers: data.matchesWithPlayers
          })
        : dispatch({ type: ACTION_TYPE.ROUND_STARTED });
    });

    connection.on(socketIOMessages.CANCEL_ROUND, () => {
      log("SERVER->CLIENT: CANCEL_ROUND");

      dispatch({ type: ACTION_TYPE.ROUND_CANCELED });
    });

    connection.on(socketIOMessages.UPDATE_SETS_RESPONSE, data => {
      log("SERVER->CLIENT: UPDATE_SETS_RESPONSE");

      if (!data) {
        console.error("No data in UPDATE_SETS_RESPONSE");
      }

      dispatch({
        type: ACTION_TYPE.UPDATE_SETS_RESPONSE,
        message: data ? data.message || "" : ""
      });
    });

    connection.on(socketIOMessages.CANCEL_COMPETITION, () => {
      log("SERVER->CLIENT: COMPETITION_CANCELED");

      dispatch({ type: ACTION_TYPE.COMPETITION_CANCELED });
    });

    connection.on(socketIOMessages.APP_DISCONNECT, () => {
      log("SERVER->CLIENT: APP DISCONNECTED");

      socket = null;
    });

    socket = connection;
  }

  //
  //
  // ----- VIEW
  //
  //

  const content = () => {
    if (state.view === VIEW.LOGIN) {
      return (
        <LoginView
          availableTables={state.availableTables}
          sendTableNumber={sendTableNumber}
        />
      );
    }

    if (state.view === VIEW.NEXT_PLAYERS) {
      return <NextPlayersView match={state.match} />;
    }

    if (state.view === VIEW.MATCH) {
      return (
        <MatchView
          match={state.match}
          sendSets={sendSets}
          updateSets={updateSets}
          addSet={addSet}
        />
      );
    }

    if (state.view === VIEW.WAITING) {
      return <WaitingView message={state.message} />;
    }

    // render nothing if none of the above states
    return <></>;
  };

  return (
    <div className="app__container">
      <div className="app__logo"></div>
      {state.view !== VIEW.LOGIN && (
        <ConnectionStatus
          isConnected={state.isConnected}
          tableNumber={state.confirmedTableNumber}
          logOut={logOut}
        />
      )}
      {content()}
    </div>
  );
}

/**
 * Remove all sets that are unplayed ( ```{player1: 0, player2: 0}``` ) expect one. The server
 * always stores five sets, but the client does not store excess empty sets.
 * @param {Match} match
 */
function filterAllUnplayedSetsExceptOne(match) {
  const allPlayedSets = match.sets.filter(
    set => set.player1 !== 0 || set.player2 !== 0
  );
  const updatedSets = [...allPlayedSets, { player1: 0, player2: 0 }];

  return { ...match, sets: updatedSets };
}

/**
 * Add empty sets because the server always stores five sets.
 * @param {[Sets]} sets
 */
function padSetArrayWithEmptySets(sets) {
  const paddedArray = [...sets];
  while (paddedArray.length < 5) {
    paddedArray.push({ player1: 0, player2: 0 });
  }

  return paddedArray;
}

/**
 * Log messages when in development mode.
 * @param {String} message
 */
function log(message) {
  if (isDev) {
    console.info(message);
  }
}

/**
 * In development the requested server is the webserver from the electron app and
 * not the development server of the react app. For production the requested server
 * is the one and only.
 */
function getServerURL() {
  const url = isDev ? "http://localhost:4000" : document.location.host;
  log("Requested server: ", url);
  return url;
}

export default App;
