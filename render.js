class Renderer {
  constructor(fieldElement, tileSize, player, findEnemyAt) {
    this.fieldElement = fieldElement;
    this.tileSize = tileSize;
    this.player = player;
    this.findEnemyAt = findEnemyAt;
  }

  updatePlayerHealth() {
    const bar = this.fieldElement.querySelector(".tileP .health");
    if (bar) {
      bar.style.width =
        (this.player.health / this.player.maxHealth) * 100 + "%";
    }
  }

  renderMap(map) {
    const field = this.fieldElement;
    field.innerHTML = "";

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tileType = map[y][x];
        const tileDiv = document.createElement("div");
        tileDiv.classList.add("tile");
        tileDiv.style.left = x * this.tileSize + "px";
        tileDiv.style.top = y * this.tileSize + "px";
        tileDiv.style.position = "absolute";
        tileDiv.setAttribute("data-x", x);
        tileDiv.setAttribute("data-y", y);

        switch (tileType) {
          case "empty":
            tileDiv.classList.add("tile-empty");
            break;

          case "tileW":
            tileDiv.classList.add("tileW");
            break;

          case "tileP":
            tileDiv.classList.add("tileP");

            const playerHealthBar = document.createElement("div");
            playerHealthBar.classList.add("health");
            playerHealthBar.style.width =
              (this.player.health / this.player.maxHealth) * 100 + "%";
            tileDiv.appendChild(playerHealthBar);

            if (this.player.hasSword) {
              const swordIcon = document.createElement("div");
              swordIcon.style.backgroundImage =
                "url(./assets/images/tile-SW.png)";
              swordIcon.style.backgroundSize = "contain";
              swordIcon.style.backgroundRepeat = "no-repeat";
              swordIcon.style.width = "20px";
              swordIcon.style.height = "20px";
              swordIcon.style.position = "absolute";
              swordIcon.style.bottom = "20px";
              swordIcon.style.right = "-10px";
              tileDiv.appendChild(swordIcon);
            }
            break;

          case "tileE":
          case "tileE_HP":
            tileDiv.classList.add("tileE");
            if (tileType === "tileE_HP") {
              tileDiv.classList.add("tileE_HP");
            }
            const enemy = this.findEnemyAt(x, y);
            if (enemy) {
              const enemyHealthBar = document.createElement("div");
              enemyHealthBar.classList.add("health");
              enemyHealthBar.style.width =
                (enemy.health / enemy.maxHealth) * 100 + "%";
              tileDiv.appendChild(enemyHealthBar);
            }
            break;

          case "tileHP":
            tileDiv.classList.add("tileHP");
            break;

          case "tileSW":
            tileDiv.classList.add("tileSW");
            break;
        }

        field.appendChild(tileDiv);
      }
    }
  }  
  
  updateTile(x, y, tileType) {
    const tileElem = this.fieldElement.querySelector(
      `[data-x='${x}'][data-y='${y}']`
    );
    if (!tileElem) return;
    const normalized = tileType === "tileE_HP" ? "tileE tileE_HP" : tileType;
    tileElem.className = "tile " + normalized;
    tileElem.innerHTML = "";

    switch (tileType) {
      case "tileP":
        const playerHealthBar = document.createElement("div");
        playerHealthBar.classList.add("health");
        playerHealthBar.style.width =
          (this.player.health / this.player.maxHealth) * 100 + "%";
        tileElem.appendChild(playerHealthBar);
        if (this.player.hasSword) {
          const swordIcon = document.createElement("div");
          swordIcon.style.backgroundImage = "url(./assets/images/tile-SW.png)";
          swordIcon.style.backgroundSize = "contain";
          swordIcon.style.backgroundRepeat = "no-repeat";
          swordIcon.style.width = "20px";
          swordIcon.style.height = "20px";
          swordIcon.style.position = "absolute";
          swordIcon.style.bottom = "20px";
          swordIcon.style.right = "-10px";
          tileElem.appendChild(swordIcon);
        }
        break;
      case "tileE":
      case "tileE_HP":
        const enemy = this.findEnemyAt(x, y);
        if (enemy) {
          const enemyHealthBar = document.createElement("div");
          enemyHealthBar.classList.add("health");
          enemyHealthBar.style.width =
            (enemy.health / enemy.maxHealth) * 100 + "%";
          tileElem.appendChild(enemyHealthBar);
        }
        break;
      default:
        break;
    }
  }
}
