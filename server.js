
const express = require('express');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const app = express();
const fireb = require("./config.json");
const firebase = require('firebase');
const client = require("socket.io-client");

var server = require('http').createServer(app);
var io = require('socket.io')(server, { origins: '*:*'});

server.listen(3074);

firebase.initializeApp(fireb);
var database = firebase.database();

var game_users = database.ref("game_users");
var game_profiles = database.ref("game_profiles");

let connections = [];
let logged_in = {};

const products = {
  "sprinkler" : 300,
  "fertilizer" : 80,
  "autopicker": 140
};

console.log("Server running...");

runClock();

//ref.on('value', gotData, errData);

app.get('/', function(req, res) {
   //res.sendFile(__dirname + '/public');
   res.sendFile(__dirname + '/public');
   //res.sendFile(__dirname + '/public');
});

app.use(express.static('public'));


// Ainakun yhteys tulee -> luodaan uusi socket
io.sockets.on('connection', newConnection);

function newConnection(socket) {

  time_send(socket.id);
  socket.emit('products', products);
  connections.push(socket);
  for (let i in logged_in){
    console.log(i + " : " + logged_in[i].id);
  }


   // Disconnect
   socket.on('disconnect', function(data) {
      connections.splice(connections.indexOf(socket), 1);
      for (let u in logged_in) {

        if (logged_in[u].id == socket.id) {
          delete logged_in[u];
          console.log("Logged out: " + u);
          return;
        }
      }
      console.log("Connections: " + connections.length);
   });

   socket.on('login_attempt', async function(data) {
      var username = data["username"];
      current_user = username;
      var password = data["password"];
      let hash = await bcrypt.hashSync(password, 10);
      var checked = data["newuser"];

      if (password.length == 0 || username.length == 0) {
        return io.to(socket.id).emit('error_text', "* Please, fill empty fields.");
      }

      if (password.length < 6) {
        return io.to(socket.id).emit('error_text', "* Password too short (Minimum 6 characters)");
      }
      if (username.length < 3) {
        return io.to(socket.id).emit('error_text', "* Username too short (Minimum 3 characters)");
      }

      if (password.length >= 21) {
        return io.to(socket.id).emit('error_text', "* Password too long (Maximum 20 characters)");
      }

      if (username.length >= 14) {
        return io.to(socket.id).emit('error_text', "* Username too long (Maximum 13 characters)");
      }
      console.log("Log: " + username + " : " + socket.id);

      if (checked) {
        return firebase.database().ref("game_users/" + username).once("value").then(d => {
            user = d.val();

            if (user == undefined || user == null) {
              let d = new Date();
              let date = {
                "year": d.getFullYear(),
                "month": d.getMonth(),
                "date": d.getDate(),
                "hour": d.getHours(),
                "minutes": d.getMinutes()
              }


              var temp_user_data =
              {
              "username": username,
              "inventory": {
                "pometrus": 0,
                "sprinkler": 0,
                "fertilizer": 0,
                "autopicker": 0,
                "money": 1000
              },
              "tree": {
                "age": 0,
                "growth": 0,
                "hydration": 30,
                "form": 0,
                "dry-time": 0,
                "fertilizer_level": 0,
                "in-use": {
                  "sprinkler": 0,
                  "autopicker": {
                    "picked": 0,
                    "timer": 0,
                  }
                }
              },
              "basic_data": {
                "pometrus_spawned": 0,
                "pometrus_picked": 0,
                "pometrus_missed": 0,
                "pometrus_fell": 0,
                "dry-time": 0,
                "fertilizer_used": 0,
                "sprinkler_used": 0,
                "autopicker_used": 0,
                "times_watered" : 0,
                "money_got" : 0,
                "pometrus_sold": 0
              },
              "currently": {
                  "pometrus" : {},
                  "hold": 1
                }

              };

              firebase.database().ref("game_users/" + username ).set({"password": hash, "joining_date": date});
              firebase.database().ref("game_profile/" + username ).set(temp_user_data);

              console.log("New user: " + username + " created.");

              logged_in[username] = socket;
              io.to(socket.id).emit('login_successful', username);
              io.to(socket.id).emit('load_tree', temp_user_data);
              delete d;

            }
            else {
              io.to(socket.id).emit('error_text', "* Username is taken.");
            }
          });
      }
      else {
        return firebase.database().ref("game_users/" + username).once("value").then(async d => {
            user = d.val();
            if (user == undefined || user == null) {
              io.to(socket.id).emit('error_text', "* Wrong username or password.");

            }
            else {
              var match = await bcrypt.compareSync(password, user["password"]);
              if (match) {
                if (logged_in[username] != null) {
                  io.to(socket.id).emit('error_text', "* You have already logged in!");
                  return;
                }

                logged_in[username] = socket;
                console.log("Logged in: " + username + "");
                io.to(socket.id).emit('login_successful', username);

                return firebase
                  .database()
                  .ref("game_profile/" + username)
                  .once("value")
                  .then(d => {
                    user_data_ = d.val();

                    io.to(socket.id).emit('load_tree', user_data_);
                    return;
                  });

              } else {
                io.to(socket.id).emit('error_text', "* Wrong username or password.");
              }
            }
          });
      }
   });

   socket.on('pometrus_picked', function(id) {

     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();
         if (_user["currently"]["pometrus"] == null) return;
         if (_user["currently"]["pometrus"][id] != null) {

           _user["currently"]["pometrus"].splice(id, 1);
           _user["inventory"]["pometrus"] += 1;
           _user["basic_data"]["pometrus_picked"] += 1;

           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);

         }

       });
   });

   socket.on('test_spawn', function() {

     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();
         if (_user["currently"]["pometrus"] == null) {
           _user["currently"]["pometrus"] = [];
         }

         var timer_despawn = Math.floor(Math.random() * 20) + 10;
         var timer_fall = Math.floor(timer_despawn * 0.3);

         var spawn_areas = {
           "2": [220, 310, 345, 360],
           "3": [220, 230, 350, 360],
           "4": [160, 135, 395, 330],
           "5": [145, 100, 420, 310],
           "6": [130, 80, 420, 310],
           "7": [130, 70, 430, 303],
           "8": [110, 70, 430, 303],
           "9": [110, 70, 430, 303]
         };

         var _x = Math.floor(Math.random() * (spawn_areas["" + _user["tree"]["form"]][2] - spawn_areas["" + _user["tree"]["form"]][0]) + spawn_areas["" + _user["tree"]["form"]][0]);
         var _y = Math.floor(Math.random() * (spawn_areas["" + _user["tree"]["form"]][3] - spawn_areas["" + _user["tree"]["form"]][1]) + spawn_areas["" + _user["tree"]["form"]][1]);

         _user["currently"]["pometrus"].push(
           {
             "x": _x,
             "y": _y,
             "num": Math.floor(Math.random() * 2) + 1,
             "fell": false,
             "timer" : timer_despawn,
             "fall": timer_fall,
             "original_y" : _y,
             "dropping": false
           }
         );

        io.to(socket.id).emit('load_tree', _user);
        firebase.database().ref("game_profile/" + current_user).set(_user);

       });
   });

   socket.on('sell_pometrus', function(amount) {
     if (amount < 1) {
       return;
     }

     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();

         if (amount == "all") {
           amount = _user["inventory"]["pometrus"];
         }

         if (_user["inventory"]["pometrus"] >= amount) {
           _user["inventory"]["pometrus"] -= amount;
           _user["basic_data"]["pometrus_sold"] += amount;
           _user["basic_data"]["money_got"] += 12*amount;
           _user["inventory"]["money"] += 12*amount;

           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);
         } else {
           return;
         }

       });
   });

   socket.on('water_tree', function(amount) {
     if (amount < 1) {
       return;
     }

     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();

         if (_user["tree"]["hydration"] >= 100) {
           return;
         } else {
           _user["tree"]["hydration"] += amount;
           _user["basic_data"]["times_watered"] += 1;
           if (_user["tree"]["hydration"] >= 100) {
             _user["tree"]["hydration"] = 100;
           }
           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);
         }
       });
   });

   socket.on('use_fertilizer', function() {
     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();

         if (_user["inventory"]["fertilizer"] <= 0) {

           // Emit alert!!!

           return;
         } else {
           _user["basic_data"]["fertilizer_used"] += 1;
           _user["inventory"]["fertilizer"] -= 1;
           _user["tree"]["fertilizer_level"] += 10;
           if (_user["tree"]["fertilizer_level"] >= 100) {
             _user["tree"]["fertilizer_level"] = 100;
           }
           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);
         }
       });
   });

   socket.on('use_sprinkler', function() {

     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();

         if (_user["inventory"]["sprinkler"] <= 0 || _user["tree"]["in-use"]["sprinkler"] > 0) {

           // Emit alert!!!

           return;
         } else {
           _user["inventory"]["sprinkler"] -= 1;
           _user["basic_data"]["sprinkler_used"] += 1;
           _user["tree"]["in-use"]["sprinkler"] = 60 * 2;
           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);
         }
       });
   });

   socket.on('use_autopicker', function() {
     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();

         if (_user["inventory"]["autopicker"] <= 0 || _user["tree"]["in-use"]["autopicker"]["timer"] > 0) {

           return;
         } else {
           _user["inventory"]["autopicker"] -= 1;
           _user["basic_data"]["autopicker_used"] += 1;
           _user["tree"]["in-use"]["autopicker"]["timer"] = 60 * 3;

           if ("pometrus" in _user["currently"]) {

             _user["inventory"]["pometrus"] += _user["currently"]["pometrus"].length;
             _user["basic_data"]["pometrus_picked"] += _user["currently"]["pometrus"].length;
             _user["tree"]["in-use"]["autopicker"]["picked"] += _user["currently"]["pometrus"].length;
             _user["currently"]["pometrus"] = [];
           }

           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);
         }
       });
   });

   socket.on('buy_fertilizer', function(amount) {
     if (amount < 1) {
       return;
     }

     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();

         if (amount == "all") {
           amount = Math.floor(_user["inventory"]["money"] / products["fertilizer"]);
         }

         if (_user["inventory"]["money"] >= amount*products["fertilizer"]) {
           _user["inventory"]["money"] -= amount*products["fertilizer"];
           _user["inventory"]["fertilizer"] += amount;

           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);
         } else {
           return;
         }

       });
   });

   socket.on('buy_sprinkler', function(amount) {
     if (amount < 1) {
       return;
     }

     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();

         if (amount == "all") {
           amount = Math.floor(_user["inventory"]["money"] / products["sprinkler"]);
         }

         if (_user["inventory"]["money"] >= amount*products["sprinkler"]) {
           _user["inventory"]["money"] -= amount*products["sprinkler"];
           _user["inventory"]["sprinkler"] += amount;

           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);
         } else {
           return;
         }

       });
   });

   socket.on('buy_autopicker', function(amount) {
     if (amount < 1) {
       return;
     }

     var current_user;
     for (let u in logged_in){
       if (logged_in[u].id == socket.id) {
         current_user = u;
         break;
       }
     }

     if (current_user == null) {
       return;
     }

     return firebase
       .database()
       .ref("game_profile/" + current_user)
       .once("value")
       .then(d => {
         _user = d.val();

         if (amount == "all") {
           amount = Math.floor(_user["inventory"]["money"] / products["autopicker"]);
         }

         if (_user["inventory"]["money"] >= amount*products["autopicker"]) {
           _user["inventory"]["money"] -= amount*products["autopicker"];
           _user["inventory"]["autopicker"] += amount;

           io.to(socket.id).emit('load_tree', _user);
           firebase.database().ref("game_profile/" + current_user).set(_user);
         } else {
           return;
         }

       });
   });

   ////

   socket.on('stay_awake', function() {
     io.to(socket.id).emit('stay_awake');
   });

}

function reset_game(user) {

  var temp_user_data =
  {
  "username": user,
  "inventory": {
    "pometrus": 0,
    "sprinkler": 0,
    "fertilizer": 0,
    "autopicker": 0,
    "money": 1000
  },
  "tree": {
    "age": 0,
    "growth": 0,
    "hydration": 30,
    "form": 0,
    "dry-time": 0,
    "fertilizer_level": 0,
    "in-use": {
      "sprinkler": 0,
      "autopicker": {
        "picked": 0,
        "timer": 0,
      }
    }
  },
  "basic_data": {
    "pometrus_spawned": 0,
    "pometrus_picked": 0,
    "pometrus_missed": 0,
    "pometrus_fell": 0,
    "dry-time": 0,
    "fertilizer_used": 0,
    "sprinkler_used": 0,
    "autopicker_used": 0,
    "times_watered" : 0,
    "money_got" : 0,
    "pometrus_sold": 0
  },
  "currently": {
      "pometrus" : {},
      "hold": 1
    }

  };

  firebase.database().ref("game_profile/" + user).set(temp_user_data);
  return temp_user_data;
}

// Server Clock
function runClock() {
    var now = new Date();
    var timeToNextTick = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(function() {
        everyMinute();
        runClock();
    }, timeToNextTick);
}

function time_send(socket_id) {
  var current_time = new Date();
  var time = {
    "minutes": current_time.getMinutes(),
    "hours": current_time.getHours(),
    "day": current_time.getDate(),
    "month": current_time.getMonth(),
    "year": current_time.getFullYear()
  }
  io.to(socket_id).emit('clock', time);
  delete current_time;
}

function everyMinute() {
  var current_time = new Date();
  var time = {
    "minutes": current_time.getMinutes(),
    "hours": current_time.getHours(),
    "day": current_time.getDate(),
    "month": current_time.getMonth(),
    "year": current_time.getFullYear()
  }
  io.sockets.emit('clock', time);
  delete current_time;

  // Suoritetaan joka minuutti jokaiselle puulle
  for (let user in logged_in) {
    firebase
      .database()
      .ref("game_profile/" + user)
      .once("value")
      .then(d => {
        _user = d.val();

        var _socket = logged_in[_user["username"]].id;
        var multi = 1;

        _user["tree"]["age"] += 1;
        if (_user["tree"]["fertilizer_level"] > 0) {
          _user["tree"]["fertilizer_level"] -= 1;
          multi = 1.5;
        }

        var ideal_point = map(_user["tree"]["form"], 0, 10, 40, 90);
        var water_bonus = (150 - 1.5 * Math.abs(ideal_point - _user["tree"]["hydration"]))/100;

        _user["tree"]["hydration"] -= 1;
        if (_user["tree"]["in-use"]["sprinkler"] > 0) {
          _user["tree"]["in-use"]["sprinkler"] -= 1;
          if (_user["tree"]["hydration"] < 60) {
            _user["tree"]["hydration"] += 2;
          }
        }

        if (_user["tree"]["hydration"] <= 0) {
          _user["tree"]["hydration"] = 0;
          _user["tree"]["dry-time"] += 1;
          _user["basic_data"]["dry-time"] += 1;

        } else {
          _user["tree"]["dry-time"] = 0;
        }

        if (_user["tree"]["dry-time"] >= 60 + 15 * _user["tree"]["form"]) {
          io.to(_socket).emit('dead', _user);
          var temp_user = reset_game(user);
          firebase
            .database()
            .ref("game_users/" + user)
            .once("value")
            .then(c => {
              var profile_user = c.val();
              if (!("trees" in profile_user)) {
                profile_user["trees"] = [_user];
                firebase.database().ref("game_users/" + user).set(profile_user);
              } else {
                profile_user["trees"].push(_user);
                firebase.database().ref("game_users/" + user).set(profile_user);
              }
              return;
            });

          return io.to(_socket).emit('load_tree', temp_user);
        }

        _user["tree"]["growth"] += 10 * multi * water_bonus;
        _user["tree"]["growth"] = Math.floor(_user["tree"]["growth"]);

        if (_user["tree"]["in-use"]["autopicker"]["timer"] > 0) {
          _user["tree"]["in-use"]["autopicker"]["timer"] -= 1;
          if ("pometrus" in _user["currently"]) {

            _user["inventory"]["pometrus"] += _user["currently"]["pometrus"].length;
            _user["basic_data"]["pometrus_picked"] += _user["currently"]["pometrus"].length;
            _user["tree"]["in-use"]["autopicker"]["picked"] += _user["currently"]["pometrus"].length;
            _user["currently"]["pometrus"] = [];
          }
        } else {
          _user["tree"]["in-use"]["autopicker"]["picked"] = 0;
          _user["tree"]["in-use"]["autopicker"]["timer"] = 0;
        }


        var growth = _user["tree"]["growth"];
        if (growth >= 6400000) {
          _user["tree"]["form"] = 9;
        }
        else if (growth >= 3200000) {
          _user["tree"]["form"] = 8;
        }
        else if (growth >= 1600000) {
          _user["tree"]["form"] = 7;
        }
        else if (growth >= 800000) {
          _user["tree"]["form"] = 6;
        }
        else if (growth >= 400000) {
          _user["tree"]["form"] = 5;
        }
        else if (growth >= 200000) {
          _user["tree"]["form"] = 4;
        }
        else if (growth >= 100000) {
          _user["tree"]["form"] = 3;
        }
        else if (growth >= 50000) {
          _user["tree"]["form"] = 2;
        }
        else if (growth >= 25000) {
          _user["tree"]["form"] = 1;
        }
        else {
          _user["tree"]["form"] = 0;
        }


        if (_user["tree"]["form"] > 1) {

          var spawn_rate_list = [120, 60, 50, 40, 30, 20, 10, 5];
          var spawn_rate = spawn_rate_list[_user["tree"]["form"] - 2] / (multi*water_bonus);

          var rnd = Math.floor(Math.random() * Math.floor(spawn_rate));
          if (rnd == 1) {

            _user["basic_data"]["pometrus_spawned"] += 1;

            if (_user["tree"]["in-use"]["autopicker"]["timer"] > 0) {
              _user["inventory"]["pometrus"] += 1;
              _user["tree"]["in-use"]["autopicker"]["picked"] += 1;
              _user["basic_data"]["pometrus_picked"] += 1;
            }
            else {
              if (_user["currently"]["pometrus"] == null) {
                _user["currently"]["pometrus"] = [];
              }


              var timer_despawn = Math.floor(Math.random() * 20) + 10;
              var timer_fall = Math.floor(timer_despawn * 0.3);

              var spawn_areas = {
                "2": [220, 310, 345, 360],
                "3": [220, 230, 350, 360],
                "4": [160, 135, 395, 330],
                "5": [145, 100, 420, 310],
                "6": [130, 80, 420, 310],
                "7": [130, 70, 430, 303],
                "8": [110, 70, 430, 303],
                "9": [110, 70, 430, 303]
              };

              var _x = Math.floor(Math.random() * (spawn_areas["" + _user["tree"]["form"]][2] - spawn_areas["" + _user["tree"]["form"]][0]) + spawn_areas["" + _user["tree"]["form"]][0]);
              var _y = Math.floor(Math.random() * (spawn_areas["" + _user["tree"]["form"]][3] - spawn_areas["" + _user["tree"]["form"]][1]) + spawn_areas["" + _user["tree"]["form"]][1]);

              _user["currently"]["pometrus"].push(
                {
                  "x": _x,
                  "y": _y,
                  "num": Math.floor(Math.random() * 2) + 1,
                  "fell": false,
                  "timer" : timer_despawn,
                  "fall": timer_fall,
                  "original_y" : _y,
                  "dropping": false
                }
              );
            }
          }
        }

        if (_user["currently"]["pometrus"] != null) {
          for (let i = 0; i < _user["currently"]["pometrus"].length; i++) {


            _user["currently"]["pometrus"][i]["timer"] -= 1;
            if (_user["currently"]["pometrus"][i]["fall"] == _user["currently"]["pometrus"][i]["timer"]) {

              //io.to(_socket).emit('drop_pometrus', i);
              _user["currently"]["pometrus"][i]["y"] = 400;
              _user["currently"]["pometrus"][i]["fell"] = true;
              _user["basic_data"]["pometrus_fell"] += 1;
              _user["currently"]["pometrus"][i]["dropping"] = true;

            }

            if (_user["currently"]["pometrus"][i]["timer"] <= 0) {

              _user["currently"]["pometrus"].splice(i, 1);

              _user["basic_data"]["pometrus_missed"] += 1;

            }
          }
        }

        io.to(_socket).emit('load_tree', _user);

        if (_user["currently"]["pometrus"] != null) {
          for (let i = 0; i < _user["currently"]["pometrus"].length; i++) {
            if (_user["currently"]["pometrus"][i]["dropping"]) {
              _user["currently"]["pometrus"][i]["dropping"] = false;
            }
          }
        }

        firebase.database().ref("game_profile/" + user).set(_user);

      });
  }
}



function client_hacked() {

}

function map(value, a, b, c, d) {
  value = (value - a) / (b - a);
  return c + value * (d - c);
}
