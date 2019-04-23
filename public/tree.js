class Tree {

    constructor(data) {
      this.pometrus_fruits = [];

      username = data["username"];
        this.username = data["username"];
        this.inventory = {
          "pometrus" : data["inventory"]["pometrus"],
          "sprinkler" : data["inventory"]["sprinkler"],
          "fertilizer" : data["inventory"]["fertilizer"],
          "autopicker" : data["inventory"]["autopicker"],
          "money" : data["inventory"]["money"]
        };
        this.basic_data = {
          "pometrus_spawned": data["basic_data"]["pometrus_spawned"],
          "pometrus_picked": data["basic_data"]["pometrus_picked"],
          "pometrus_missed": data["basic_data"]["pometrus_missed"],
          "pometrus_fell": data["basic_data"]["pometrus_fell"],
          "dry-time": data["basic_data"]["dry-time"],
          "fertilizer_used": data["basic_data"]["fertilizer_used"],
          "sprinkler_used": data["basic_data"]["sprinkler_used"],
          "autopicker_used": data["basic_data"]["autopicker_used"],
          "times_watered" : data["basic_data"]["times_watered"],
          "money_got" : data["basic_data"]["money_got"],
          "pometrus_sold" : data["basic_data"]["pometrus_sold"]

        };
        this.tree = {
          "age": data["tree"]["age"],
          "hydration": data["tree"]["hydration"],
          "form": data["tree"]["form"],
          "fertilizer_level": data["tree"]["fertilizer_level"],
          "in-use": {
            "sprinkler": data["tree"]["in-use"]["sprinkler"],
            "autopicker": data["tree"]["in-use"]["autopicker"]
          }
        }

        if ("pometrus" in data["currently"]) {

          for (var fruit in data["currently"]["pometrus"]) {
            var dir = data["currently"]["pometrus"][fruit];
            this.pometrus_fruits.push(new Pometrus(dir["x"], dir["y"], dir["original_x"], dir["num"], dir["fell"] ));
          }
        } else {
          this.pometrus_fruits = [];

        }

    }

    update_data(data) {
      username = data["username"];
      this.username = data["username"];
      this.inventory = {
        "pometrus" : data["inventory"]["pometrus"],
        "sprinkler" : data["inventory"]["sprinkler"],
        "fertilizer" : data["inventory"]["fertilizer"],
        "autopicker" : data["inventory"]["autopicker"],
        "money" : data["inventory"]["money"]
      };
      this.basic_data = {
        "pometrus_spawned": data["basic_data"]["pometrus_spawned"],
        "pometrus_picked": data["basic_data"]["pometrus_picked"],
        "pometrus_missed": data["basic_data"]["pometrus_missed"],
        "pometrus_fell": data["basic_data"]["pometrus_fell"],
        "dry-time": data["basic_data"]["dry-time"],
        "fertilizer_used": data["basic_data"]["fertilizer_used"],
        "sprinkler_used": data["basic_data"]["sprinkler_used"],
        "autopicker_used": data["basic_data"]["autopicker_used"],
        "times_watered" : data["basic_data"]["times_watered"],
        "money_got" : data["basic_data"]["money_got"],
        "pometrus_sold" : data["basic_data"]["pometrus_sold"]
      };
      this.tree = {
        "age": data["tree"]["age"],
        "hydration": data["tree"]["hydration"],
        "form": data["tree"]["form"],
        "fertilizer_level": data["tree"]["fertilizer_level"],
        "in-use": {
          "sprinkler": data["tree"]["in-use"]["sprinkler"],
          "autopicker": data["tree"]["in-use"]["autopicker"]
        }
      }

      if ("pometrus" in data["currently"]) {
        if (data["currently"]["pometrus"].length < this.pometrus_fruits.length) {
          var ce = this.pometrus_fruits.length - data["currently"]["pometrus"].length;
          this.pometrus_fruits.splice(-ce, ce);
        }
        for (var fruit in data["currently"]["pometrus"]) {
          var dir = data["currently"]["pometrus"][fruit];
          if (this.pometrus_fruits[fruit] == null) {
            this.pometrus_fruits.push(new Pometrus(dir["x"], dir["y"], dir["original_x"], dir["num"], dir["fell"] ));
          } else {
            this.pometrus_fruits[fruit].update(dir);
          }
        }
      } else {
        this.pometrus_fruits = [];

      }
    }

    show() {
      image(images["tree_" + (this.tree.form + 1)], res*30, res*25, images["tree_" + (this.tree.form + 1) ].width , images["tree_" + (this.tree.form + 1)].height);
      for (var fruit in this.pometrus_fruits) {
        this.pometrus_fruits[fruit].show();
      }


    }

}

function Pometrus(_x, _y, _original_x, _num, _fell) {

  this.x = _x;
  this.y = _y;
  this.num = _num;
  this.w = images["pometrus_" + this.num].width;
  this.h = images["pometrus_" + this.num].height;
  this.fell = _fell;
  this.original_x = _original_x;
  this.dropping = false;

  this.show = function() {
    image(images["pometrus_" + this.num], this.x, this.y);
  }

  this.drop = function(speed = 1) {
    if (this.y < 400) {
      this.y += speed;
      if (this.y > 400) {
        this.y = 400;
      }
      setTimeout(() => {
        this.drop(speed + 1);
      }, 1/frameRate);

    }
    this.dropping = false;
    return;
  }

  this.update = function(data) {
    this.x = data["x"];
    this.y = data["y"];
    this.num = data["num"];
    this.fell = data["fell"];
    this.original_y = data["original_y"];
    this.dropping = data["dropping"];

    if (this.dropping) {
      this.y = this.original_y;
      this.drop();
    }

  }

  this.intersects = function(_x, _y) {
    if (this.x <= _x && this.x + this.w > _x && this.y <= _y && this.y + this.h > _y) {
      return true;
    } else {
      return false;
    }
  }
}

function Sprinkler(_x, _y) {
  this.x = _x;
  this.y = _y;
  this.w = images["sprinkler"].width;
  this.h = images["sprinkler"].height;
  this.waterdrops = [];

  this.waterdrops.push(new Water_drop(this.x, this.y));


  this.show = function() {
    image(images["sprinkler"], this.x, this.y);
    for (var i = 0; i < this.waterdrops.length; i++) {
      this.waterdrops[i].show();
      this.waterdrops[i].update();

    }

    if (this.waterdrops.length >= 180) {
      this.waterdrops.splice(0, 1);
    }
    this.waterdrops.push(new Water_drop(this.x + 40, this.y- 10));

    if (this.intersects(mouseX, mouseY)) {
      var info = tree.tree["in-use"]["sprinkler"] + "mins left";
      textSize(11);
      var text_width = textWidth(info);
      noTint();
      image(images["hover_bg"], mouseX - 50, mouseY - 35);
      fill(0);
      textAlign(CENTER, CENTER);
      text(info, mouseX - 50 + images["hover_bg"].width/2, mouseY - 35 + images["hover_bg"].height/2);
      textAlign(LEFT, CENTER);
      tint(calculate_tint());
    }

  }

  this.intersects = function(_x, _y) {
    if (this.x <= _x && this.x + this.w > _x && this.y <= _y && this.y + this.h > _y) {
      return true;
    } else {
      return false;
    }
  }

}

function Water_drop(_x, _y) {
  this.y = _y;
  this.x = _x;
  this.rnd = floor(random()*300)/300;
  this.yspeed = -12.5 + this.rnd*3.7;
  this.xspeed = 2.2 - this.rnd*0.7;
  this.gravity = 0.45 + this.rnd*0.04;
  this.gravitymulti = 1;
  this.scale = floor(random() * 3) + 1;

  this.show = function() {

    fill(50, 50, 220, 40);
    rectMode(CENTER);
    rect(this.x, this.y, this.scale*3, this.scale*3);
    rectMode(CORNER);
  }

  this.update = function() {
    this.yspeed += this.gravity;

    if (this.gravity < 0.02) {
      this.gravitymulti = 1;
    }
    if (this.gravity > 0.05) {
      this.gravitymulti = -1;
    }

    this.gravityaddon = 0.01 * this.gravitymulti;
    this.gravity += this.gravityaddon;


    this.x += this.xspeed;
    this.y += this.yspeed;

  }
}

function Autopicker(_x, _y) {
  this.x = _x;
  this.y = _y;
  this.w = images["autopicker"].width;
  this.h = images["autopicker"].height;

  this.show = function() {
    image(images["autopicker"], this.x, this.y);
    fill(10,35,10);
    textSize(10);
    text(tree.tree["in-use"]["autopicker"]["picked"], this.x + 10, this.y + 62);
    if (this.intersects(mouseX, mouseY)) {
      var info = tree.tree["in-use"]["autopicker"]["timer"] + "mins left";
      textSize(11);
      var text_width = textWidth(info);
      noTint();
      image(images["hover_bg"], mouseX - 70, mouseY - 35);
      fill(0);
      textAlign(CENTER, CENTER);
      text(info, mouseX - 70 + images["hover_bg"].width/2, mouseY - 35 + images["hover_bg"].height/2);
      textAlign(LEFT, CENTER);

      tint(calculate_tint());
    }
  }

  this.intersects = function(_x, _y) {
    if (this.x <= _x && this.x + this.w > _x && this.y <= _y && this.y + this.h > _y) {
      return true;
    } else {
      return false;
    }
  }

}
