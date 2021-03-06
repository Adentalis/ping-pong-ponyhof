/**
 * @author William Kistenberger
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Competition.css";

// components
import Popup from "./Popup";

const COMPETITION_STATE = require("../../shared/models/competition-state");

/**
 * Creates a Competition in the list of Competitions with Link and delete option
 */
function Competition(props) {
  const {
    competition: { id, state, name, playmode, date },
    deleteCompetition,
    hasActiveGame
  } = props;

  const [showPopupActiveError, setShowPopupActiveError] = useState(false);
  const handleCloseActiveError = () => setShowPopupActiveError(false);
  const handleShowActiveError = () => setShowPopupActiveError(true);

  const [showPopupDelete, setShowPopupDelete] = useState(false);
  const handleCloseDelete = () => setShowPopupDelete(false);
  const handleShowDelete = () => setShowPopupDelete(true);

  let popupText = "Willst du dieses Turnier wirklich löschen?";
  let containerCss = "competition__container";
  if (
    state === COMPETITION_STATE.COMP_ACTIVE_ROUND_READY ||
    state === COMPETITION_STATE.COMP_ACTIVE_ROUND_ACTIVE
  ) {
    popupText = "Das laufende Turnier wird gelöscht!";
    containerCss = "competition__container competition__container--active";
  }

  return (
    <div className={containerCss}>
      <LinkHandler
        id={id}
        name={name}
        date={date}
        state={state}
        handleShowActiveError={handleShowActiveError}
        hasActiveGame={hasActiveGame}
      ></LinkHandler>
      <Popup
        show={showPopupActiveError}
        handleClose={handleCloseActiveError}
        header="Achtung!"
        bodyText="Ein anderes Turnier ist aktiv"
        mode="noBtn"
      ></Popup>

      <button className="competition__btn competition__btn--gametype">
        {playmode}
      </button>
      <button
        className="competition__btn competition__btn--delete"
        onClick={handleShowDelete}
      >
        Löschen
      </button>
      <Popup
        show={showPopupDelete}
        handleClose={handleCloseDelete}
        header="Achtung!"
        bodyText={popupText}
        buttonFunk={() => deleteCompetition(id)}
        buttonText="Löschen"
        mode="primary"
      ></Popup>
    </div>
  );
}
/**
 * LinkHandler decides if object returned is a Link to Competition View or a Button that opens a Popup
 */
const LinkHandler = ({
  id,
  name,
  state,
  date,
  handleShowActiveError,
  hasActiveGame
}) => {
  const competitionID = "/competition/" + id;

  if (
    hasActiveGame &&
    !(
      state === COMPETITION_STATE.COMP_ACTIVE_ROUND_READY ||
      state === COMPETITION_STATE.COMP_ACTIVE_ROUND_ACTIVE
    )
  ) {
    return (
      <div
        onClick={handleShowActiveError}
        className="competition__btn competition__btn--gameload competition__link"
      >
        {name} vom {date}
      </div>
    );
  } else {
    return (
      <Link
        to={competitionID}
        className="competition__btn competition__btn--gameload competition__link"
      >
        {name} vom {date}
      </Link>
    );
  }
};

export default Competition;
