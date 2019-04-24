var socket;

function preload() {
  pixel_font = loadFont('depixelbreit.otf');

  images = {

    "button" : loadImage('images/btn_regular.png'),
    "button_small" : loadImage('images/btn_small.png'),
    "button_small_wide" : loadImage('images/btn_small_wide.png'),
    "interface" : loadImage('images/interface.png'),
    "top_bar" : loadImage('images/top_bar.png'),
    "bottom_bar" : loadImage('images/bottom_bar.png'),
    "meters" : loadImage('images/meters.png'),
    "num_box" : loadImage('images/num_box.png'),
    "button_up" : loadImage('images/btn_up.png'),
    "button_down" : loadImage('images/btn_down.png'),
    "hover_bg" : loadImage('images/hover_bg.png'),
    "box" : loadImage('images/box.png'),
    "cell_outline" : loadImage("images/outline_cell.png"),
    "bar_outline" : loadImage("images/outline_bar.png"),
    "sprinkler_if" : loadImage("images/sprinkler_if.png"),

    "background" : loadImage('images/background.png'),

    "watering_can_i" : loadImage('images/watering_can_icon.png'),
    "coin_i" : loadImage('images/coin_icon.png'),
    "close_i" : loadImage('images/close_icon.png'),
    "stats_i" : loadImage('images/stats_icon.png'),
    "fertilizer_i" : loadImage('images/fertilizer_icon.png'),
    "autopicker_i" : loadImage('images/autopicker_icon.png'),
    "user_i" : loadImage('images/user_icon.png'),
    "shop_i" : loadImage('images/shop_icon.png'),
    "inv_i" : loadImage('images/inv_icon.png'),
    "pometrus_i" : loadImage('images/pometrus_icon.png'),
    "sprinkler_i" : loadImage('images/sprinkler_icon.png'),

    "hill" : loadImage('images/hill.png'),
    "tree_1" : loadImage('images/tree_1.png'),
    "tree_2" : loadImage('images/tree_2.png'),
    "tree_3" : loadImage('images/tree_3.png'),
    "tree_4" : loadImage('images/tree_4.png'),
    "tree_5" : loadImage('images/tree_5.png'),
    "tree_6" : loadImage('images/tree_6.png'),
    "tree_7" : loadImage('images/tree_7.png'),
    "tree_8" : loadImage('images/tree_8.png'),
    "tree_9" : loadImage('images/tree_9.png'),
    "tree_10" : loadImage('images/tree_10.png'),

    "pometrus_1" : loadImage('images/pometrus_1.png'),
    "pometrus_2" : loadImage('images/pometrus_2.png'),

    "autopicker" : loadImage('images/autopicker.png'),
    "sprinkler" : loadImage('images/sprinkler.png'),

    "pometrus_logo" : loadImage("images/pometrus_logo.png")

  };

}

function setup() {
  var canvas = createCanvas(250*res, 250*res);
  frameRate(10);
  canvas.parent('game');
  document.getElementById("game").style.display = "none";


  socket = io.connect('/');


  // Socket controllers
  socket.on('error_text', error_text);
  socket.on('login_successful', login_successful);
  socket.on('clock', clock);
  socket.on('load_tree', load_tree);
  socket.on('dead', show_dead);
  socket.on('stay_awake', stay_awake);

  socket.on('products', function(_products) {
    products = _products;
  });

  socket.on('drop_pometrus', drop_pometrus);
  socket.on('spawn_pometrus', spawn_pometrus);

  textFont(pixel_font);

  stay_awake_timer();

  background(201, 237, 237);

  image(images["background"], 0, 0, 250*res, 250*res);
  image(images["hill"], 0, 190*res, images["hill"].width, images["hill"].height);

  bot_bar = new Bottom_bar();
  top_bar = new Top_bar();

  // Buttons
  water_button = new Button(images["button"], images["watering_can_i"], res*3, res*6 + images["button"].height + images["meters"].height);
  ferti_button = new Button(images["button"], images["fertilizer_i"], res*3,  res*9 + images["button"].height*2 + images["meters"].height);
  inv_button = new Button(images["button_small_wide"], images["inv_i"], res*3, height - images["button_small_wide"].height - res*3);
  shop_button = new Button(images["button_small_wide"], images["shop_i"], res*4 + images["button_small_wide"].width, height - images["button_small_wide"].height - res*3);
  stats_button = new Button(images["button_small_wide"], images["stats_i"], res*5 + images["button_small_wide"].width*2, height - images["button_small_wide"].height - res*3);

  top_bar.show();
  bot_bar.show();
  water_button.show();
  ferti_button.show();

}

function clock(time) {
  current_time = time;
  var add = "";
  if (time["minutes"] < 10) {
    add = "0";
  }
  timetext = time[ "hours"] + ":" + add + time["minutes"] + " "
  + time["day"] + "/" + (time["month"] + 1) + "/" + ("" + time["year"]).substring(2, 4);
}

function login() {

  let checked = document.getElementById("newuser").checked;

  socket.emit('login_attempt',
  {
    "username": document.getElementById("username").value,
    "password": document.getElementById("password").value,
    "newuser": checked
  });

}

function error_text(text) {
  document.getElementById("error").textContent = text;
}

function login_successful(obj) {
  username = obj;
  console.log(username);
  document.getElementById("container").remove();
  document.getElementById("game").style.display = "block";
}

function stay_awake_timer() {

setTimeout(function() {
    socket.emit("stay_awake");
    stay_awake_timer();
  }, 10000);
}

function stay_awake() {

}
