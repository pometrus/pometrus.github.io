var res = 2;
var username = "";

var tree = null;
var timetext = "";

var current_time;
var products;

var meters;
var top_bar;
var bot_bar;

var inventory = null;
var shop = null;
var statistics = null;

var water_button;
var ferti_button;
var inv_button;
var shop_button;
var stats_button;

var images = {};
var pixel_font;

///
var sprinkler = [];
var autopicker = [];
var dead_window;


function load_tree(data) {

  if (tree == null) {
    tree = new Tree(data);

    // Iterfaces
    meters = new Meters(tree.tree.fertilizer_level, tree.tree.hydration, res*3, res * 26);


    if (tree.tree["in-use"]["sprinkler"] > 0 && sprinkler.length == 0) {
      sprinkler.push(new Sprinkler(35, 400));
    }

    if (tree.tree["in-use"]["autopicker"]["timer"] > 0 && autopicker.length == 0) {
      autopicker.push(new Autopicker(420, 360));
    }


  }
  else {
    tree.update_data(data);
    meters.update(tree.tree.fertilizer_level, tree.tree.hydration);

    if (tree.tree["in-use"]["sprinkler"] > 0 && sprinkler.length == 0) {
      sprinkler.push(new Sprinkler(35, 400));
    }

    if (tree.tree["in-use"]["sprinkler"] <= 0 && sprinkler.length != 0) {
      sprinkler = [];
    }

    if (tree.tree["in-use"]["autopicker"]["timer"] > 0 && autopicker.length == 0) {
      autopicker.push(new Autopicker(420, 360));
    }

    if (tree.tree["in-use"]["autopicker"]["timer"] <= 0 && autopicker.length != 0) {
      autopicker = [];
    }
  }

  redraw_all();


}

function redraw_all() {

  if (tree == null) {
    return;
  }

  image(images["background"], 0, 0, 250*res, 250*res);
  image(images["hill"], 0, 190*res, images["hill"].width, images["hill"].height);

  // LIVING ELEMTES

  tree.show();
  if (sprinkler.length > 0) {
    sprinkler[0].show();
  }

  if (autopicker.length > 0) {
    autopicker[0].show();
  }

  //

  meters.show();

  if (inventory != null) {
    inventory.show();
  }

  if (shop != null) {
    shop.show();
  }

  if (statistics != null) {
    statistics.show();
  }

  if (dead_window != null) {
    dead_window.show();
  }

}

function mousePressed() {
  if (username == "") return;

  if (dead_window != null) {
    dead_window = null;
    return;
  }

  if (inventory != null) {

    inventory.all_intersects();
    ///
    if (inventory.close_button.intersects(mouseX, mouseY)) {
      inventory = null;
    }

    if (inv_button.intersects(mouseX, mouseY)) {
      inventory = null;
    }
    if (shop_button.intersects(mouseX, mouseY)) {
      inventory = null;
      shop = new Shop();
    }
    if (stats_button.intersects(mouseX, mouseY)) {
      inventory = null;
      statistics = new Statistics(tree);
    }
    return;
  };

  if (shop != null) {

    ////

    shop.all_intersects();

    if (shop.close_button.intersects(mouseX, mouseY)) {
      shop = null;
    }
    if (shop_button.intersects(mouseX, mouseY)) {
      shop = null;
    }
    if (inv_button.intersects(mouseX, mouseY)) {
      shop = null;
      inventory = new Inventory();
    }
    if (stats_button.intersects(mouseX, mouseY)) {
      shop = null;
      statistics = new Statistics(tree);
    }
    return;
  };

  if (statistics != null) {


    ////
    if (statistics.close_button.intersects(mouseX, mouseY)) {
      statistics = null;
    }
    if (stats_button.intersects(mouseX, mouseY)) {
      statistics = null;
    }
    if (shop_button.intersects(mouseX, mouseY)) {
      statistics = null;
      shop = new Shop();
    }
    if (inv_button.intersects(mouseX, mouseY)) {
      statistics = null;
      inventory = new Inventory();
    }
    return;
  };

  if (water_button.intersects(mouseX, mouseY)) {
    water_tree(10);
  }
  if (ferti_button.intersects(mouseX, mouseY)) {
    use_fertilizer();
  }

  if (inv_button.intersects(mouseX, mouseY)) {
    inventory = new Inventory(tree.inventory);

  }

  if (shop_button.intersects(mouseX, mouseY)) {
    shop = new Shop();
  }

  if (stats_button.intersects(mouseX, mouseY)) {
    statistics = new Statistics(tree);
  }

  for (var fruit in tree.pometrus_fruits) {
    if (tree.pometrus_fruits[fruit].intersects(mouseX, mouseY)) {
      socket.emit('pometrus_picked', fruit);
    }
  }

  redraw_all();

}

//////////////////
//////////////////
//////////////////

function spawn_pometrus(data) {
  var x = data["x"];
  var y = data["y"];
  var num = data["num"];
  var fell = data["fell"];

  var id = data["id"];

  tree.pometrus_fruits[id] = new Pometrus(x, y, num, fell);

}

function drop_pometrus(id) {
  tree.pometrus_fruits[id].drop();
}

function test_spawn() {
  socket.emit('test_spawn');
}
/*function despawn_pometrus(id) {
  tree.pometrus_fruits[id].remove();
}*/

function calculate_tint() {
  var hour = current_time["hours"];
  var minutes = current_time["minutes"];

  if (hour < 21 && hour >= 8) {
    return 255;
  }

  else if (hour >= 22 || hour < 6) {
    return 100;
  }
  else {

    if (hour >= 21 || hour < 22) {
      var m = map(minutes, 0, 60, 255, 100);
      return m;
    }

    if (hour >= 6 && hour < 8) {
      var m = map(minutes, 0, 60, 100, 255);
      return m;
    }

  }
}

function show_dead(data) {
  dead_window = new Dead(data);


}

function sell_pometrus(amount) {
  socket.emit('sell_pometrus', amount);
}

function water_tree(amount) {
  socket.emit('water_tree', amount);
}

function use_fertilizer() {
  socket.emit('use_fertilizer');
}

function use_sprinkler() {
  socket.emit('use_sprinkler');
}

function use_autopicker() {
  socket.emit('use_autopicker');
}

function buy_fertilizer(amount) {
  socket.emit('buy_fertilizer', amount);
}

function buy_sprinkler(amount) {
  socket.emit('buy_sprinkler', amount);
}

function buy_autopicker(amount) {
  socket.emit('buy_autopicker', amount);
}
