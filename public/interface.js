function Meters(fertilizer, hydration, x, y) {
  this.x = x;
  this.y = y;
  this.fertilizer = fertilizer;
  this.hydration = hydration;

  this.show = function() {

    fill(255);
    rect(this.x + res*2, this.y+ res*2, images["meters"].width - 8*res, images["meters"].height - 8*res);

    fill(124, 109, 92);
    var _h_f = map(this.fertilizer, 0, 100, 0, 123/2 * res);
    rect(this.x + res*7, this.y + res*8 + (123/2 * res - _h_f), 10 * res, _h_f);

    fill(60, 150, 225);
    var _h_h = map(this.hydration, 0, 100, 0, 123/2 * res);
    rect(this.x + res*8 + res*10, this.y + res*8 + (123/2 * res - _h_h), 10 * res, _h_h);

    image(images["meters"], this.x, this.y, images["meters"].width, images["meters"].height);

    textAlign(CENTER, CENTER);
    fill(0);
    textSize(5.5*res);
    text(this.fertilizer, this.x + 11*res, this.y + 80*res);
    text(this.hydration, this.x + 24*res, this.y + 80*res);
  }

  this.update = function(_fertilizer, _hydration) {
    this.fertilizer = _fertilizer;
    this.hydration = _hydration;
  }
}

function Top_bar() {
  this.w = width;
  this.h = 6 * res;

  this.show = function() {
    noStroke();
    image(images["top_bar"], 0, 0, images["top_bar"].width, images["top_bar"].height);
    image(images["user_i"], res*9, res*6, images["user_i"].width, images["user_i"].height);

    fill(0);
    textAlign(RIGHT, CENTER);
    textSize(6*res);
    text(timetext, width - res*12, 12*res);

    textAlign(LEFT, CENTER);
    textSize(7*res);
    text(username, res*22, 12*res);

    image(images["pometrus_logo"], res*104, res*3, images["pometrus_logo"].width, images["pometrus_logo"].height);

  }

}

function Bottom_bar() {
  this.w = width;
  this.h = 8 * res;

  this.show = function() {
    noStroke();
    image(images["bottom_bar"], 0, height - images["bottom_bar"].height, images["bottom_bar"].width, images["bottom_bar"].height);

    stats_button.show();
    inv_button.show();
    shop_button.show();

    fill(0);
    textAlign(LEFT, CENTER);
    textSize(7*res);

    if (tree != null) {
      text(tree.inventory.pometrus, res*111, height - 11*res);
      image(images["pometrus_i"], res*96, height - res*17, images["pometrus_i"].width, images["pometrus_i"].height);

      text(tree.inventory.money, res*69.5 + res*111, height - 11*res);
      image(images["coin_i"], res*71 + res*96, height - res*17, images["coin_i"].width, images["coin_i"].height);
    }
  }

}

function Button(bg_image, icon_image, _x, _y,) {
  this.x = _x;
  this.y = _y;
  this.w = bg_image.width;
  this.h = bg_image.height;
  this.background = bg_image;
  this.icon = icon_image;

  this.intersects = function(_x, _y) {
    if (this.x <= _x && this.x + this.w > _x && this.y <= _y && this.y + this.h > _y) {
      return true;
    } else {
      return false;
    }
  }

  this.show = function() {
    image(this.background, this.x, this.y, this.w, this.h);
    image(this.icon, this.x + (this.background.width/2 - this.icon.width/2), this.y + (this.background.height/2 - this.icon.height/2), this.icon.width, this.icon.height);
  }
}

function Shop(_tree) {
  this.tree = _tree;
  this.x = res*41;
  this.y = res*26;
  this.cells = [];

  this.close_button = new Button(images["button_small"], images["close_i"], this.x + images["interface"].width - images["button_small"].width - res*4, this.y + res*4);

  this.cells.push(new Pometrus_sell_cell(this.x + 15, this.y + 73));
  this.cells.push(new Buy_cell(this.x + 15, this.y + 97 + 72, "fertilizer", buy_fertilizer));
  this.cells.push(new Buy_cell(this.x + 15, this.y + 97 + 72*2, "sprinkler", buy_sprinkler));
  this.cells.push(new Buy_cell(this.x + 15, this.y + 97 + 72*3, "autopicker", buy_autopicker));


  this.show = function() {

    image(images["interface"], this.x, this.y, images["interface"].width, images["interface"].height);
    this.close_button.show();

    textSize(10*res);
    textAlign(LEFT, CENTER);
    fill(0);
    text("Shop", this.x + res*9, this.y + res*13);

    for (var x in this.cells) {
      this.cells[x].show();
    }
    textSize(14);
    text("Sell:", this.x + res*10, this.y + res*30.5);
    text("Buy:", this.x + res*10, this.y + res *78);
  }

  this.all_intersects = function() {
    for (var x in this.cells) {
      this.cells[x].all_intersects();
    }
  }
}

function Buy_cell(_x, _y, _product, _function) {
  this.x = _x;
  this.y = _y;
  this.w = images["cell_outline"].width;
  this.h = images["cell_outline"].height;
  this.product = _product;
  this.name = this.product.charAt(0).toUpperCase() + this.product.slice(1);
  this.amount = 1;

  this.num_box = new Button_text(images["num_box"], this.amount, this.x + 288, this.y + (this.h - images["num_box"].height)/2);
  this.btn_up = new Button_no_icon(images["button_up"], this.x + 288 + (images["num_box"].width - images["button_up"].width)/2, this.y + res*2);
  this.btn_dw = new Button_no_icon(images["button_down"], this.x + 288 + (images["num_box"].width - images["button_down"].width)/2, this.y + res*24);
  this.btn_buy = new Button_text(images["button"], "BUY", this.x + 326, this.y + (this.h - images["button"].height)/2);

  this.show = function() {
    image(images["cell_outline"], this.x, this.y, this.w, this.h);
    noStroke();
    image(images["button"], this.x + 4*res, this.y + (this.h - images["button"].height)/2);
    image(images[this.product + "_i"], this.x + res*4 + (images["button"].width - images[this.product + "_i"].width)/2, this.y + (this.h - images[this.product + "_i"].height)/2);
    fill(0);

    textAlign(LEFT, CENTER);
    textSize(14);
    text(this.name, this.x + images["button"].width + 8*res, this.y + this.h/2);

    textAlign(RIGHT, CENTER);
    if (this.amount == "all") {
      text(Math.floor(tree.inventory.money / products[this.product]) * products[this.product], this.x + 252, this.y + this.h/2);

    } else {
      text(products[this.product]*this.amount, this.x + 252, this.y + this.h/2);

    }
    image(images["coin_i"], this.x + 252 + res*3, this.y + (this.h - images["coin_i"].height)/2);

    this.num_box.show();
    this.btn_up.show();
    this.btn_dw.show();
    if (products[this.product] > tree.inventory.money) {
      tint(200);
    }
    if (this.amount != "all") {
      if (products[this.product]*this.amount > tree.inventory.money) {
        tint(200);
      }
    }
    this.btn_buy.show();
    noTint();

  }

  this.all_intersects = function() {
    if (this.btn_up.intersects(mouseX, mouseY)) {
      if (this.amount == 1) {
        this.amount = 10;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 10) {
        this.amount = 100;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 100) {
        this.amount = "all";
        this.num_box.text = this.amount;
      }
      else if (this.amount == "all") {
        this.amount = 1;
        this.num_box.text = this.amount;
      }
    }

    if (this.btn_dw.intersects(mouseX, mouseY)) {
      if (this.amount == "all") {
        this.amount = 100;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 100) {
        this.amount = 10;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 10) {
        this.amount = 1;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 1) {
        this.amount = "all";
        this.num_box.text = this.amount;
      }
    }

    if (this.btn_buy.intersects(mouseX, mouseY)) {
      _function(this.amount);
    }


  }

}

function Pometrus_sell_cell(_x, _y) {
  this.x = _x;
  this.y = _y;
  this.w = images["cell_outline"].width;
  this.h = images["cell_outline"].height;
  this.name = "Pometrus";
  this.amount = 1;

  this.num_box = new Button_text(images["num_box"], this.amount, this.x + 288, this.y + (this.h - images["num_box"].height)/2);
  this.btn_up = new Button_no_icon(images["button_up"], this.x + 288 + (images["num_box"].width - images["button_up"].width)/2, this.y + res*2);
  this.btn_dw = new Button_no_icon(images["button_down"], this.x + 288 + (images["num_box"].width - images["button_down"].width)/2, this.y + res*24);
  this.btn_sell = new Button_text(images["button"], "SELL", this.x + 326, this.y + (this.h - images["button"].height)/2);

  this.show = function() {
    image(images["cell_outline"], this.x, this.y);
    noStroke();
    image(images["button"], this.x + 4*res, this.y + (this.h - images["button"].height)/2);
    image(images["pometrus_i"], this.x + res*4 + (images["button"].width - images["pometrus_i"].width)/2, this.y + (this.h - images["pometrus_i"].height)/2);
    fill(0);

    textAlign(LEFT, CENTER);
    textSize(14);
    text(this.name, this.x + images["button"].width + 8*res, this.y + this.h/2);

    textAlign(RIGHT, CENTER);
    if (this.amount == "all") {

      text(12*tree.inventory.pometrus, this.x + 252, this.y + this.h/2);

    } else {

      text(12*this.amount, this.x + 252, this.y + this.h/2);

    }
    image(images["coin_i"], this.x + 252 + res*3, this.y + (this.h - images["coin_i"].height)/2);

    this.num_box.show();
    this.btn_up.show();
    this.btn_dw.show();
    if (tree.inventory.pometrus == 0) {
      tint(200);
    }
    if (this.amount != "all") {
      if (this.amount > tree.inventory.pometrus) {
        tint(200);
      }
    }
    this.btn_sell.show();
    noTint();

  }

  this.all_intersects = function() {
    if (this.btn_up.intersects(mouseX, mouseY)) {
      if (this.amount == 1) {
        this.amount = 10;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 10) {
        this.amount = 100;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 100) {
        this.amount = "all";
        this.num_box.text = this.amount;
      }
      else if(this.amount == "all") {
        this.amount = 1;
        this.num_box.text = this.amount;
      }
    }

    if (this.btn_dw.intersects(mouseX, mouseY)) {
      if (this.amount == "all") {
        this.amount = 100;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 100) {
        this.amount = 10;
        this.num_box.text = this.amount;
      }
      else if (this.amount == 10) {
        this.amount = 1;
        this.num_box.text = this.amount;
      }
      else if(this.amount == 1) {
        this.amount = "all";
        this.num_box.text = this.amount;
      }
    }

    if (this.btn_sell.intersects(mouseX, mouseY)) {
      sell_pometrus(this.amount);
    }


  }

}

function Use_cell(_x, _y, _product, _function) {
  this.x = _x;
  this.y = _y;
  this.w = images["cell_outline"].width;
  this.h = images["cell_outline"].height;
  this.product = _product;
  this.name = this.product.charAt(0).toUpperCase() + this.product.slice(1);

  this.btn_use = new Button_text(images["button"], "USE", this.x + 326, this.y + (this.h - images["button"].height)/2);

  this.show = function() {
    image(images["cell_outline"], this.x, this.y);
    noStroke();
    image(images["button"], this.x + 4*res, this.y + (this.h - images["button"].height)/2);
    image(images[this.product + "_i"], this.x + res*4 + (images["button"].width - images[this.product + "_i"].width)/2, this.y + (this.h - images[this.product + "_i"].height)/2);
    fill(0);

    textAlign(LEFT, CENTER);
    textSize(14);
    text(this.name, this.x + images["button"].width + 8*res, this.y + this.h/2);

    text(tree.inventory[this.product], this.x + 252, this.y + this.h/2);

    if (tree.inventory[this.product] <= 0) {
      tint(200);
    }
    this.btn_use.show();
    noTint();

  }

  this.all_intersects = function() {

    if (this.btn_use.intersects(mouseX, mouseY)) {
      _function();
    }


  }
}

function Button_no_icon(_bg_image, _x, _y,) {
  this.x = _x;
  this.y = _y;
  this.w = _bg_image.width;
  this.h = _bg_image.height;
  this.background = _bg_image;

  this.intersects = function(_x, _y) {
    if (this.x <= _x && this.x + this.w > _x && this.y <= _y && this.y + this.h > _y) {
      return true;
    } else {
      return false;
    }
  }

  this.show = function() {
    image(this.background, this.x, this.y, this.w, this.h);
  }
}

function Button_text(_bg_image, _text, _x, _y,) {
  this.x = _x;
  this.y = _y;
  this.w = _bg_image.width;
  this.h = _bg_image.height;
  this.background = _bg_image;
  this.text = _text;

  this.intersects = function(_x, _y) {
    if (this.x <= _x && this.x + this.w > _x && this.y <= _y && this.y + this.h > _y) {
      return true;
    } else {
      return false;
    }
  }

  this.show = function() {
    image(this.background, this.x, this.y, this.w, this.h);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(this.text, this.x + this.w/2, this.y + this.h/2);
    textAlign(LEFT);
  }
}

function Inventory(_inv) {
  this.inv = _inv;
  this.x = res*41;
  this.y = res*26;
  this.cells = [];

  var all_usable_items = ["fertilizer", "sprinkler", "autopicker"];
  var usable_items = all_usable_items.slice(0);

  for (var item in all_usable_items) {
    if (tree.inventory[all_usable_items[item]] <= 0) {
      usable_items.splice(usable_items.indexOf(all_usable_items[item]), 1);
    }
  }

  for (var item in usable_items) {
    this.cells.push(new Use_cell(this.x + 15, this.y + 88 + 72*item, usable_items[item], eval("use_" + usable_items[item])));
  }

  this.close_button = new Button(images["button_small"], images["close_i"], this.x + images["interface"].width - images["button_small"].width - res*4, this.y + res*4);

  this.show = function() {

    image(images["interface"], this.x, this.y, images["interface"].width, images["interface"].height);
    this.close_button.show();

    textSize(10*res);
    textAlign(LEFT, CENTER);
    fill(0);
    text("Inventory", this.x + res*9, this.y + res*13);

    for (var x in this.cells) {
      this.cells[x].show();
    }
    image(images["bar_outline"], this.x + 8*res, this.y + res*25);
    image(images["bar_outline"], this.x + 93*res, this.y + res*25);
    image(images["pometrus_i"], this.x + 12*res, this.y + res*28);
    image(images["coin_i"], this.x + 97*res, this.y + res*28);
    textAlign(LEFT, CENTER);
    textSize(14);
    text(tree.inventory.pometrus, this.x + 27*res, this.y + res*34);
    text(tree.inventory.money, this.x + 110.5*res, this.y + res*34);

  }

  this.all_intersects = function() {
    for (var x in this.cells) {
      this.cells[x].all_intersects();
    }
  }
}

function Statistics(_tree) {
  this.tree = _tree;
  this.x = res*41;
  this.y = res*26;

  this.close_button = new Button(images["button_small"], images["close_i"], this.x + images["interface"].width - images["button_small"].width - res*4, this.y + res*4);
  this.show = function() {

    image(images["interface"], this.x, this.y, images["interface"].width, images["interface"].height);
    this.close_button.show();

    textSize(10*res);
    textAlign(LEFT, CENTER);
    fill(0);
    text("Statistics", this.x + res*9, this.y + res*13);

    textSize(17);

    text("Username: " + this.tree.username , this.x  + res*10, this.y + res*21 + 12*res);
    text("Tree age: " + this.tree.tree.age + "min", this.x  + res*10, this.y + res*21 + 12*res*2);
    text("Pometrus picked: " + this.tree.basic_data.pometrus_picked , this.x  + res*10, this.y + res*21 + 12*res*3);
    text("Pometrus missed: " + this.tree.basic_data.pometrus_missed, this.x  + res*10, this.y + res*21 + 12*res*4);
    text("Pometrus fell: " + this.tree.basic_data.pometrus_fell, this.x  + res*10, this.y + res*21 + 12*res*5);
    text("Pometrus produced: " + this.tree.basic_data.pometrus_spawned, this.x  + res*10, this.y + res*21 + 12*res*6);
    text("Dry-time: " + this.tree.basic_data["dry-time"] + "min" , this.x  + res*10, this.y + res*21 + 12*res*7);
    text("Times watered: " + this.tree.basic_data.times_watered, this.x  + res*10, this.y + res*21 + 12*res*8);
    text("Fertilizer used: " + this.tree.basic_data.fertilizer_used, this.x  + res*10, this.y + res*21 + 12*res*9);
    text("Sprinkler used: " + this.tree.basic_data.sprinkler_used, this.x  + res*10, this.y + res*21 + 12*res*10);
    text("Autopicker used: " + this.tree.basic_data.autopicker_used, this.x  + res*10, this.y + res*21 + 12*res*11);
    text("Money got: " + this.tree.basic_data.money_got, this.x  + res*10, this.y + res*21 + 12*res*12);
    text("Pometrus sold: " + this.tree.basic_data.pometrus_sold, this.x + res*10, this.y + res*21 + 12*res*13);

    /*
    How many trees died
    how many players online

    */
  }

}

function Dead(data) {
  this.w = images["box"].width;
  this.h = images["box"].height;
  this.x = width/2 - this.w/2;
  this.y = height/2 - this.h/2;
  this.temptree = new Tree(data);

  this.show = function() {
    image(images["box"], this.x, this.y);
    fill(0);
    textSize(14);
    text("Your tree died", this.x + res*9, this.y +res*10);
    textSize(11);
    text("Username: " + this.temptree.username , this.x  + res*9, this.y + res*12 + 9*res);
    text("Tree age: " + this.temptree.tree.age + "min", this.x  + res*9, this.y + res*12 + 9*res*2);
    text("Pometrus picked: " + this.temptree.basic_data.pometrus_picked , this.x  + res*9, this.y + res*12 + 9*res*3);
    text("Pometrus missed: " + this.temptree.basic_data.pometrus_missed, this.x  + res*9, this.y + res*12 + 9*res*4);
    text("Pometrus fell: " + this.temptree.basic_data.pometrus_fell, this.x  + res*9, this.y + res*12 + 9*res*5);
    text("Pometrus produced: " + this.temptree.basic_data.pometrus_spawned, this.x  + res*9, this.y + res*12 + 9*res*6);
    text("Dry-time: " + this.temptree.basic_data["dry-time"] + "min" , this.x  + res*9, this.y + res*12 + 9*res*7);
    text("Times watered: " + this.temptree.basic_data.times_watered, this.x  + res*9, this.y + res*12 + 9*res*8);
    text("Fertilizer used: " + this.temptree.basic_data.fertilizer_used, this.x  + res*9, this.y + res*12 + 9*res*9);
    text("Sprinkler used: " + this.temptree.basic_data.sprinkler_used, this.x  + res*9, this.y + res*12 + 9*res*10);
    text("Autopicker used: " + this.temptree.basic_data.autopicker_used, this.x  + res*9, this.y + res*12 + 9*res*11);
    text("Money got: " + this.temptree.basic_data.money_got, this.x  + res*9, this.y + res*12 + 9*res*12);
    text("Pometrus sold: " + this.temptree.basic_data.pometrus_sold, this.x  + this.y + res*12 + 9*res*13);


  }
}
