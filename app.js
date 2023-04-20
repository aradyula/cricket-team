const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//Get players details
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team order by player_id;`;
  const playerDetails = await db.all(getPlayersQuery);
  const camelCasePlayerDetails = playerDetails.map((each) => {
    return convertDbObjectToResponseObject(each);
  });

  response.send(camelCasePlayerDetails);
});
// adding player
app.post("/players/", async (request, response) => {
  const { playerName, role, jerseyNumber } = request.body;
  const addPlayerQuery = `insert into 
  cricket_team (player_name,jersey_number,role) 
    values ('${playerName}',${jerseyNumber},'${role}');`;
  const newPlayer = await db.run(addPlayerQuery);

  response.send(`Player Added to Team`);
});
// get player based on playerId
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerById = `select * from cricket_team where player_id=${playerId};`;
  const player = await db.get(getPlayerById);
  const camelCasePlayerDetails = convertDbObjectToResponseObject(player);
  console.log(camelCasePlayerDetails);
  response.send(camelCasePlayerDetails);
});
//update playerDetails
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayer = `UPDATE 
    cricket_team 
  set 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}' 
    where 
    player_id=${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deleteBookQuery);

  response.send("Player Removed");
});

module.exports = app;
