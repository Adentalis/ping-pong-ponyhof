import React from "react";

import ScoreBoard from "../components/ScoreBoard";
import Player from "../components/Player";
import Title from "../components/Title";

function MatchView({
  onlyShowNextPlayers,
  match,
  tableNumber,
  sendSets,
  updateSets,
  addSet
}) {
  return (
    <div>
      {onlyShowNextPlayers ? (
        <NextPlayers match={match}></NextPlayers>
      ) : (
        <ScoreBoard
          match={match}
          sendSets={sendSets}
          updateSets={updateSets}
          addSet={addSet}
          tableNumber={tableNumber}
        />
      )}
    </div>
  );
}

function NextPlayers({ match }) {
  return (
    <>
      <Title text="Als nächstes spielen:"></Title>
      <span></span>
      <Player player={match.player1}></Player>
      <Player player={match.player2}></Player>
    </>
  );
}

export default MatchView;
