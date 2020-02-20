import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './CompetitionPage.css';
import '../Colors.css';

//componenten
import Popup from './Popup';
import Footer from './Footer';
import Button from './Button';
import CompetitionPage__Header from './CompetitionPage__Header';

// shared service
import IPCService from '../../shared/ipc/ipcRendererService';

const USE_BROWSER = false;

const IpAdressAndStatisticLink = competitionID => {
  const statisticID = '/statisticTable/' + competitionID;
  return (
    <div className="competitionPage__link-alignment">
      <div className="competitionPage__link-ip-adress-statistic">
        {' '}
        IP-Adresse{' '}
      </div>
      <Link className="competitionPage__link-back-to-overview" to={statisticID}>
        Statistik
      </Link>
    </div>
  );
};

const TableHeadline = () => {
  return (
    <div className="competitionPage__center-table">
      <div className="competitionPage__table__first-row-style">
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Tisch{' '}
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Spieler 1
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          :{' '}
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Spieler 2{' '}
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Satz 1{' '}
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Satz 2{' '}
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Satz 3{' '}
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Satz 4{' '}
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Satz 5{' '}
        </strong>
        <strong className="competitionPage__table__column-alignment">
          {' '}
          Ergebnis{' '}
        </strong>
      </div>
    </div>
  );
};

const TableRow = ({ match }) => {
<<<<<<< HEAD
  let stringSet = ['0:0', '0:0', '0:0', '0:0', '0:0'];
  let index = 0;
=======
<<<<<<< HEAD
  var stringSet = ['0:0', '0:0', '0:0', '0:0', '0:0'];
  var index = 0;
>>>>>>> master
  match.sets.forEach(set => {
    stringSet[index] = set.player1 + ' : ' + set.player2;
    index++;
  });
  /*
  const set1 = match.sets[0][0] + ' : ' + match.sets[0][1];
  const set2 = match.sets[1][0] + ' : ' + match.sets[1][1];
=======
  const set1 = match.sets[0].player1 + ' : ' + match.sets[0].player2;
  const set2 = match.sets[1].player1 + ' : ' + match.sets[1].player2;
>>>>>>> d569c61dbf64956e294761ebb9263291eefd5b06
  const set3 = 0; //= match.sets[2][0] + ' : ' + match.sets[2][1];
  const set4 = 0; //= match.sets[3][0] + ' : ' + match.sets[3][1];
  const set5 = 0; //= match.sets[4][0] + ' : ' + match.sets[4][1];
  */
  return (
    <div className="competitionPage__center-table">
      <div className="competitionPage__table__first-row-alignment">
        <div className="competitionPage__table__column-alignment"> </div>
        <div className="competitionPage__table__column-alignment">
          {' '}
          {match.player1}
        </div>
        <div className="competitionPage__table__column-alignment"> : </div>
        <div className="competitionPage__table__column-alignment">
          {' '}
          {match.player2}{' '}
        </div>
        <div className="competitionPage__table__column-alignment">
          {' '}
          {stringSet[0]}{' '}
        </div>
        <div className="competitionPage__table__column-alignment">
          {' '}
          {stringSet[1]}{' '}
        </div>
        <div className="competitionPage__table__column-alignment">
          {' '}
          {stringSet[2]}{' '}
        </div>
        <div className="competitionPage__table__column-alignment">
          {' '}
          {stringSet[3]}{' '}
        </div>
        <div className="competitionPage__table__column-alignment">
          {' '}
          {stringSet[4]}{' '}
        </div>
        <div className="competitionPage__table__column-alignment">
          {' '}
          Ergebnis{' '}
        </div>
      </div>
    </div>
  );
};

const Table = ({ matches }) => {
  return (
    <div>
      <TableHeadline />
      {matches.map(match => {
        return <TableRow key={match.id} match={match} />;
      })}
    </div>
  );
};

const CompetitionPage = () => {
  //dummy match
  const { competitionID } = useParams();
  const [matches, setMatches] = useState([]);
  const [players, setPlayer] = useState([]);

  useEffect(() => {
    updateCompetition()
  }, []);

  const updateCompetition = () => {
    if (USE_BROWSER) {
      const matches = [
        {
          id: 3,
          player1: 'Samuel Geiger',
          player2: 'Marius Bach',
          sets: [
            { player1: 11, player2: 13},
            { player1: 4, player2: 11}
          ],
          freeTicket: false,
          compId: 1
        },
        {
          id: 4,
          player1: 'Edith Finch',
          player2: 'Finch Assozial',
          sets: [
            { player1: 13, player2: 15},
            { player1: 14, player2: 16}
          ],
          freeTicket: false,
          compId: 1
        }
      ];

      console.log(matches);
      setMatches(matches);
      return;
    }

    IPCService.getMatchesByCompetition(competitionID, (matchData) => {
      console.log(matchData);
      setMatches(matchData);

      const playerData = IPCService.getPlayersByPlayerId();
      setPlayer(playerData);
    });
  };

  const [showPopupEndTournament, setShowPopupEndTournament] = useState(false);
  const handleCloseEndTournament = () => setShowPopupEndTournament(false);
  const handleShowEndTournament = () => setShowPopupEndTournament(true);

  const [showPopupEndRound, setShowPopupEndRound] = useState(false);
  const handleCloseEndRound = () => setShowPopupEndRound(false);
  const handleShowEndRound = () => setShowPopupEndRound(true);

  const handleEndTournament = () => {
    handleCloseEndTournament();
  };

  const handleEndRound = () => {
    handleCloseEndRound();
  };

  return (
    <div>
      <p>competitionID: {competitionID}</p>
      <CompetitionPage__Header
        playmode="Scheizer System"
        startDate="02.02.2020"
        linkTitle="zur Übersicht"
        linkDestination="/"
      />
      <IpAdressAndStatisticLink competitionID={competitionID} />
      <Table matches={matches} />
      <div className="competitionPage__Bottom-Buttons">
        <Button
          onClick={handleShowEndTournament}
          text="Tunier abschließen"
          mode="primary"
        ></Button>
        <Popup
          show={showPopupEndTournament}
          handleClose={handleCloseEndTournament}
          header="Sicher?"
          bodyText="Möchtest du wirklich das Tunier beenden?"
          buttonFunk={() => handleEndTournament()}
          buttonText="Beenden"
          mode="primary"
        ></Popup>
        <Button
          onClick={handleShowEndRound}
          text="Runde beenden"
          mode="primary"
        ></Button>
        <Popup
          show={showPopupEndRound}
          handleClose={handleCloseEndRound}
          header="Bist du dir sicher?"
          bodyText="Möchtest du wirklich die Runde beenden?"
          buttonFunk={() => handleEndRound()}
          buttonText="Beenden"
          mode="primary"
        ></Popup>
      </div>
      <Footer title="Die Tabelle" />
    </div>
  );
};

export default CompetitionPage;
