import React, { useState } from "react";
import "./App.css";

// import shared
import io from "socket.io-client";
import socketIOMessages from "../shared/socket-io-messages";

// import routing components
import Login from "./pages/Login/Login";
import WaitForRound from "./pages/WaitForRound/WaitForRound";
import Match from "./pages/Match";

import Title from "./components/Title";

const appTitle = "TTRace";

// for development: the requested server is the webserver
//                  from the electron app and not the
//                  development server of the react app
// for production:  the requested server is the one and only
const isDev = true;
const getServerURL = () => {
  const url = isDev ? "localhost:4000" : document.location.host;
  console.log("Requested server: ", url);
  return url;
};

function App() {
  const [socket, setSocket] = useState(null);
  const [page, setPage] = useState("login");
  const [isConnected, setIsConnected] = useState(false);

  const [availableTables, setAvailableTables] = useState([]);
  const [tableNumber, setTableNumber] = useState(-1);
  const [matchWithPlayers, setMatchWithPlayers] = useState(null);

  const toPage = page => {
    setPage(page);
  };

  const content = () => {
    if (page === "login") {
      return (
        <Login
          appTitle={appTitle}
          isConnected={isConnected}
          availableTables={availableTables}
          tableNumber={tableNumber}
          sendTableNumber={sendTableNumber}
          tableNumberChanged={handleTableNumberChange}
        />
      );
    } else if (page === "wait") {
      return <WaitForRound appTitle={appTitle} isConnected={isConnected} />;
    } else if (page === "no-competition") {
      return (
        <div>
          <Title title="No competition started yet, please wait."></Title>
        </div>
      );
    } else if (page === "match") {
      return (
        <Match
          appTitle={appTitle}
          isConnected={isConnected}
          matchWithPlayers={matchWithPlayers}
        />
      );
    }
  };

  const sendTableNumber = event => {
    event.preventDefault();
    socket.emit(socketIOMessages.LOGIN_TABLE, { tableNumber });
  };

  const handleTableNumberChange = event => {
    setTableNumber(event.target.value);
  };

  if (!socket) {
    const base_url = getServerURL();
    const connection = io(base_url);

    connection.on(socketIOMessages.AVAILABLE_TABLES, tables => {
      console.log(tables);

      setAvailableTables(tables);
      setTableNumber(tables[0]);
    });

    connection.on(socketIOMessages.LOGIN_TABLE, data => {
      const { tableNumber, matchStarted } = data;
      console.log(data);
      setIsConnected(true);

      console.log("matchStart ->", matchStarted);
      matchStarted
        ? connection.emit(socketIOMessages.GET_MATCH, { tableNumber })
        : toPage("wait");

      connection.on(socketIOMessages.START_ROUND, () => {
        connection.emit(socketIOMessages.GET_MATCH, { tableNumber });
      });

      connection.on(socketIOMessages.SEND_MATCH, data => {
        const { matchWithPlayers } = data;
        console.log(matchWithPlayers);

        setMatchWithPlayers(matchWithPlayers);
        toPage("match");
      });
    });

    connection.on(socketIOMessages.LOGIN_ERROR, data => {
      const { tableNumber } = data;
      alert(
        `A device is already connected with the table ${tableNumber} or all slots are busy`
      );
    });

    setSocket(connection);
  }

  return <div className="client-container">{content()}</div>;
}

export default App;
