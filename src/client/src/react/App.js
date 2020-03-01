import React, { useEffect, useState, useReducer } from "react";
import "./App.css";
import { isMatchFinished } from "./lib";

// import shared
import io from "socket.io-client";
import socketIOMessages from "../shared/socketIOMessages";

// COMPONENTS
import LoginView from "./views/LoginView";
import WaitingView from "./views/WaitingView";
import MatchView from "./views/MatchView";
import ConnectionStatus from "./components/ConnectionStatus";
import Title from "./components/Title";

const TITLE = "TTRace";

let socket;
const isDev = true;

const getServerURL = () => {
  // for development: the requested server is the webserver
  //                  from the electron app and not the
  //                  development server of the react app
  // for production:  the requested server is the one and only
  const url = isDev ? "localhost:4000" : document.location.host;
  console.info("Requested server: ", url);
  return url;
};

const CLIENT_STATE = {
  LOGIN: "login",
  WAITING: "waiting",
  MATCH: "match",
  NEXT_PLAYERS: "next-players"
};

const ACTION_TYPE = {
  SET_TABLE_NUMBER: "setTableNumber",
  LOGGED_IN: "loggedIn",
  TABLES_AVAILABLE: "tablesAvailable",
  ROUND_CANCELED: "roundCanceled",
  ROUND_STARTED: "roundStarted",
  ROUND_AVAILABLE: "roundAvailable",
  COMPETITION_CANCELED: "competitionCanceled"
};

const initialState = {
  view: CLIENT_STATE.LOGIN,
  isConnected: false,
  availableTables: [],
  match: undefined,
  tableNumber: undefined,
  message: "",
  roundStarted: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPE.SET_TABLE_NUMBER:
      return { ...state, tableNumber: action.tableNumber };

    case ACTION_TYPE.LOGGED_IN:
      return loggedIn(state, action);

    case ACTION_TYPE.TABLES_AVAILABLE:
      return {
        ...state,
        availableTables: action.availableTables,
        tableNumber: setTableNumber(state.tableNumber, action.availableTables)
      };

    case ACTION_TYPE.ROUND_CANCELED:
      return {
        ...state,
        match: undefined,
        roundStarted: false,
        message: "Runde abgebrochen, kleinen Moment bitte!",
        view: CLIENT_STATE.WAITING
      };

    case ACTION_TYPE.ROUND_STARTED:
      return state;

    case ACTION_TYPE.ROUND_AVAILABLE:
      return roundAvailable(state, action);

    case ACTION_TYPE.COMPETITION_CANCELED:
      return state;

    default:
      return state;
  }
};

function roundAvailable(state, action) {
  const localMatch = action.matches.find(
    match => match.tableNumber === state.tableNumber
  );

  if (localMatch) {
    return {
      ...state,
      match: localMatch,
      view: CLIENT_STATE.NEXT_PLAYERS,
      message: ""
    };
  }
  console.error(
    "Couldn't start round. No match found for table " + state.tableNumber
  );
  return state;
}

function loggedIn(state, action) {
  const { isConnected, match, roundStarted, message } = action;
  const newState = { ...state, isConnected, match, roundStarted, message };

  if (message) {
    console.error(message);
    return { ...state, message };
  }

  if (match && isMatchFinished(match)) {
    console.info("match is finished");
    return {
      ...newState,
      message: "Spiel beendet. Warten auf die nächste Runde.",
      view: CLIENT_STATE.WAITING
    };
  }

  if (match && roundStarted) {
    console.info("round is started");
    return { ...newState, view: CLIENT_STATE.MATCH };
  }

  if (match) {
    console.info("round is started");
    return { ...newState, view: CLIENT_STATE.NEXT_PLAYERS };
  }

  return {
    ...newState,
    message: "Kein laufendes Turnier.",
    view: CLIENT_STATE.WAITING
  };
}

function setTableNumber(currentNumber, tables) {
  const isNotSet = currentNumber < 1;
  const isNotAvailable = !tables.find(n => n === currentNumber);

  if (isNotSet || isNotAvailable) {
    // pick first available number
    return tables[0];
  }
  return currentNumber;
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // set tableNumber when availableTables are non-empty
  // useEffect(() => {
  //   if (state.tableNumber < 0 && state.availableTables.length > 0) {
  //     dispatch({
  //       type: "setTableNumber",
  //       tableNumber: state.availableTables[0]
  //     });
  //   }
  // }, [state]);

  const content = () => {
    if (state.view === CLIENT_STATE.LOGIN) {
      return (
        <LoginView
          availableTables={state.availableTables}
          tableNumber={state.tableNumber}
          sendTableNumber={sendTableNumber(state.tableNumber)}
          tableNumberChanged={handleTableNumberChange}
        />
      );
    }

    if (
      state.view === CLIENT_STATE.NEXT_PLAYERS ||
      state.view === CLIENT_STATE.MATCH
    ) {
      return (
        <MatchView
          onlyShowNextPlayers={state.view === CLIENT_STATE.NEXT_PLAYERS}
          match={state.match}
          // sendSets={sendSets}
        />
      );
    }

    if (state.view === CLIENT_STATE.WAITING) {
      return <WaitingView message={state.message} />;
    }

    // render nothing if none of the above states
    return <></>;
  };

  const sendTableNumber = tableNumber => event => {
    event.preventDefault();
    console.info("CLIENT->SERVER: LOGIN_REQUEST");
    socket.emit(socketIOMessages.LOGIN_REQUEST, { tableNumber });
    // setWaitingMessage("waiting for server response");
    // setView("WAITING");
  };

  // const sendSets = match => event => {
  //   const finished = isMatchFinished(match);
  //   const data = {
  //     sets: match.sets,
  //     finished,
  //     tableNumber: match.tableNumber
  //   };

  //   console.info("CLIENT->SERVER: UPDATE_SETS_REQUEST");
  //   socket.emit(socketIOMessages.UPDATE_SETS_REQUEST, data);

  //   if (finished) {
  //     localMatch(undefined);
  //     setWaitingMessage("waiting for next round");
  //     setView("WAITING");
  //   }
  // };

  const handleTableNumberChange = event => {
    const newTableNumber = parseInt(event.target.value, 10);

    dispatch({
      type: ACTION_TYPE.SET_TABLE_NUMBER,
      tableNumber: newTableNumber
    });
  };

  // register sockets for client - server communication
  if (!socket) {
    const base_url = getServerURL();
    const connection = io(base_url);

    connection.on(socketIOMessages.AVAILABLE_TABLES, tables => {
      console.info("SERVER->CLIENT: AVAILABLE_TABLES");

      dispatch({ type: ACTION_TYPE.TABLES_AVAILABLE, availableTables: tables });
    });

    connection.on(socketIOMessages.LOGIN_RESPONSE, data => {
      console.info("SERVER->CLIENT: LOGIN_RESPONSE");

      const { roundStarted, match, message } = data;
      dispatch({
        type: ACTION_TYPE.LOGGED_IN,
        message,
        match,
        isConnected: !message,
        roundStarted
      });
    });

    connection.on(socketIOMessages.NEXT_ROUND, data => {
      console.info("SERVER->CLIENT: NEXT_ROUND");

      dispatch({
        type: ACTION_TYPE.ROUND_AVAILABLE,
        matches: data.matchesWithPlayers
      });
    });

    // connection.on(socketIOMessages.START_ROUND, () => {
    //   console.info("SERVER->CLIENT: START_ROUND");

    //   if (view !== "NEXT_PLAYERS") {
    //     console.error("Wrong view, could not start round");
    //     return;
    //   }

    //   setView("MATCH");
    // });

    connection.on(socketIOMessages.CANCEL_ROUND, () => {
      console.info("SERVER->CLIENT: CANCEL_ROUND");

      dispatch({ type: ACTION_TYPE.ROUND_CANCELED });
    });

    // connection.on(socketIOMessages.UPDATE_SETS_RESPONSE, () => {
    //   console.info("SERVER->CLIENT: UPDATE_SETS_RESPONSE");

    //   console.info("Could not send sets, trying again in 1000 ms.");
    //   const { sets } = localMatch;
    //   setInterval(
    //     () =>
    //       socket.emit(socketIOMessages.UPDATE_SETS_REQUEST, {
    //         tableNumber,
    //         sets
    //       }),
    //     1000
    //   );
    // });

    // connection.on(socketIOMessages.COMPETITION_CANCELED, () => {
    //   console.info("SERVER->CLIENT: COMPETITION_CANCELED");

    //   if (view === "LOGIN") {
    //     return;
    //   }

    // setView("NO_COMP");
    // });

    socket = connection;
  }

  return (
    <div className="client-container">
      <Title title={TITLE} />
      <ConnectionStatus isConnected={state.isConnected} />
      {content()}
    </div>
  );
}

export default App;
