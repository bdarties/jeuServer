const http = require("http");
const fs = require("fs");
const url = require("url");
const parseur = require("querystring");

let tabSockJoueurs = new Array();
var socketPlayer1 = undefined;
var socketPlayer2 = undefined;

// Creation du serveur
var monServeur = http.createServer(function (req, res) {
  // on récupere les éléments complémentaires de la requete (apres ? )
  var paramsURL = url.parse(req.url).query;
  //on transforme les parametres en tableau
  var tabParamsURL = parseur.parse(paramsURL);

  if ("action" in tabParamsURL && tabParamsURL["action"] == "play") {
    fs.readFile("./src/client.html", function (error, content) {
      res.end(content);
    });
  } else {
    fs.readFile("./src" + url.parse(req.url).href, function (error, content) {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(content);
    });
  }
});

var io = require("socket.io")(monServeur);

// Quand un client se connecte, on lui crée une socket dediee
io.on("connection", function (sockVersClient) {
  sockVersClient.on("selectPerso", function (message) {
    console.log("le player " + message + " a rejoint le jeu");

    // cas ou le premier player rejoint le jeu
    if (message == "1") {
      socketPlayer1 = sockVersClient;
      socketPlayer1.emit("ack", "player1 confirmé");
      socketPlayer1.on("mouvement", function (action) {
        console.log("déplacement recu de P1 :" + action);
        socketPlayer1.emit("ack", action);
        if (socketPlayer2 !== undefined)
          socketPlayer2.emit("mouvement", action);
      });
    }

    if (message == "2") {
      socketPlayer2 = sockVersClient;
      socketPlayer2.emit("ack", "player2 confirmé");
      console.log("etat de socket P2 (apres) :" + socketPlayer2);
      socketPlayer2.on("mouvement", function (action) {
        console.log("déplacement recu de P2 :" + action);
        socketPlayer2.emit("ack", action);
        if (socketPlayer1 !== undefined)
          socketPlayer1.emit("mouvement", action);
      });
    }
  });
});
monServeur.listen(8080);
