class Game {
  constructor() {
    this.fieldElement = document.querySelector(".field");
    this.tileSize = 25;
    this.tilesX = 40;
    this.tilesY = 24;
    this.map = [];
    this.player = {
      x: 0,
      y: 0,
      health: 100,
      maxHealth: 100,
      attack: 10,
      hasSword: false,
    };
    this.enemies = [];
    this.renderer = new Renderer(
      document.querySelector(".field"),
      this.tileSize,
      this.player,
      this.findEnemyAt.bind(this)
    );
  }

  init() {
    this.createMap();
    this.connectRooms();
    this.generateRooms(randomInt(5, 10), 3, 8);
    this.placeItems();
    this.placePlayer();
    this.renderer.renderMap(this.map);
    this.setupControls();
    this.resetEnemies();
    this.placeEnemies(10);
    this.renderer.renderMap(this.map);
  }

  isWalkable(x, y) {
    if (x < 0 || y < 0 || y >= this.map.length || x >= this.map[0].length) {
      return false;
    }
    const tile = this.map[y][x];
    return tile === "empty" || tile === "tileHP" || tile === "tileSW";
  }

  startEnemyMovement() {
    this.enemyMoveInterval = setInterval(() => {
      this.moveEnemies();
    }, 1500);
  }

  placeItems() {
    for (let i = 0; i < 2; i++) {
      this.placeRandom("tileSW");
    }
    for (let i = 0; i < 10; i++) {
      this.placeRandom("tileHP");
    }
  }

  placeEnemies(count = 10) {
    while (this.enemies.length < count) {
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const x = Math.floor(Math.random() * room.width + room.x);
      const y = Math.floor(Math.random() * room.height + room.y);

      if (
        !this.enemies.some((e) => e.x === x && e.y === y) &&
        this.map[y][x] === "empty"
      ) {
        this.enemies.push({ x, y, health: 30, maxHealth: 30, attack: 5 });
        this.map[y][x] = "tileE";
      }
    }
  }

  resetEnemies() {
    for (const enemy of this.enemies) {
      this.map[enemy.y][enemy.x] = "empty";
    }
    this.enemies = [];
  }

  moveEnemies() {
    this.enemies.forEach((enemy) => {
      const oldX = enemy.x;
      const oldY = enemy.y;

      const dxTotal = this.player.x - enemy.x;
      const dyTotal = this.player.y - enemy.y;
      const stepX = dxTotal === 0 ? 0 : dxTotal > 0 ? 1 : -1;
      const stepY = dyTotal === 0 ? 0 : dyTotal > 0 ? 1 : -1;

      // Определяем приоритетную ось: где расстояние больше
      const tryFirstAxisX = Math.abs(dxTotal) >= Math.abs(dyTotal);

      const tryMoves = [];
      if (tryFirstAxisX && stepX !== 0) tryMoves.push([stepX, 0]);
      if (stepY !== 0) tryMoves.push([0, stepY]);
      if (!tryFirstAxisX && stepX !== 0) tryMoves.push([stepX, 0]);

      // Если по обоим осям уже на месте (враг на игроке) — атакуем
      let hasAttacked = false;
      if (enemy.x === this.player.x && enemy.y === this.player.y) {
        this.attackPlayer();
        hasAttacked = true;
        return;
      }

      let moved = false;
      for (const [dx, dy] of tryMoves) {
        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        if (
          newX >= 0 &&
          newX < this.tilesX &&
          newY >= 0 &&
          newY < this.tilesY
        ) {
          // Если целевая клетка — игрок, атакуем
          if (this.player.x === newX && this.player.y === newY) {
            this.attackPlayer();
            moved = true; // считаем ход совершенным
            hasAttacked = true;
            break;
          }
          const targetTile = this.map[newY][newX];
          // Двигаемся в пустые клетки и на зелья; стены и враги — блок
          if (targetTile === "empty" || targetTile === "tileHP") {
            const wasOnPotion = this.map[oldY][oldX] === "tileE_HP";
            this.map[oldY][oldX] = wasOnPotion ? "tileHP" : "empty";
            this.map[newY][newX] = targetTile === "tileHP" ? "tileE_HP" : "tileE";
            enemy.x = newX;
            enemy.y = newY;
            this.renderer.updateTile(oldX, oldY, this.map[oldY][oldX] === "tileHP" ? "tileHP" : "tile-empty");
            this.renderer.updateTile(newX, newY, this.map[newY][newX]);
            moved = true;
            break;
          }
        }
      }

      // Если не смогли сдвинуться (оба направления заняты) — стоим на месте
      // После хода (или простоя) — если рядом с игроком, атакуем
      if (!hasAttacked) {
        const manhattan = Math.abs(enemy.x - this.player.x) + Math.abs(enemy.y - this.player.y);
        if (manhattan === 1) {
          this.attackPlayer();
        }
      }
    });
  }

  attackPlayer() {
    this.player.health -= 10;
    this.renderer.updatePlayerHealth();
    this.checkGameOver();
  }

  checkGameOver() {
    if (this.player.health <= 0) {
      clearInterval(this.enemyMoveInterval);
      alert("Игра окончена! Вы проиграли.");
      this.restart();
      return;
    }
    if (this.enemies.length === 0) {
      clearInterval(this.enemyMoveInterval);
      alert("Поздравляем! Все враги побеждены.");
      this.restart();
    }
  }

  restart() {
    clearInterval(this.enemyMoveInterval);
    this.fieldElement.innerHTML = "";
    this.map = [];
    this.enemies = [];
    Object.assign(this.player, {
      x: 0,
      y: 0,
      health: 100,
      maxHealth: 100,
      attack: 10,
      hasSword: false,
    });
    this.gameOver = false;
    this.init();
  }

  placeRandom(tileType) {
    while (true) {
      const x = 1 + Math.floor(Math.random() * (this.tilesX - 2));
      const y = 1 + Math.floor(Math.random() * (this.tilesY - 2));
      if (this.map[y][x] === "empty") {
        this.map[y][x] = tileType;
        break;
      }
    }
  }

  placeRandomItems(type, count) {
    let placed = 0;
    while (placed < count) {
      const x = 1 + Math.floor(Math.random() * (this.tilesX - 2));
      const y = 1 + Math.floor(Math.random() * (this.tilesY - 2));
      if (this.map[y][x] === "empty") {
        this.map[y][x] = type;
        placed++;
      }
    }
  }

  createMap() {
    this.map = Array.from({ length: this.tilesY }, () =>
      Array.from({ length: this.tilesX }, () => "tileW")
    );
    this.rooms = [];
  }

  placePlayer() {
    const room = this.rooms[0];
    const x = Math.floor(room.x + room.width / 2);
    const y = Math.floor(room.y + room.height / 2);
    Object.assign(this.player, {
      x,
      y,
      health: 100,
      maxHealth: 100,
      attack: 10,
      hasSword: false,
    });

    this.map[y][x] = "tileP";
  }

  pickupItem(x, y) {
    const tile = this.map[y][x];
    if (tile === "tileHP") {
      this.player.health = Math.min(
        this.player.health + 20,
        this.player.maxHealth
      );
      this.renderer.updatePlayerHealth();
    } else if (tile === "tileSW") {
      this.player.attack += 5;
      this.player.hasSword = true;
    }
  }

  generateRooms(maxRooms = 8, roomMinSize = 3, roomMaxSize = 8) {
    const isOverlapping = (r1, r2) =>
      r1.x - 1 < r2.x + r2.width &&
      r1.x + r1.width + 1 > r2.x &&
      r1.y - 1 < r2.y + r2.height &&
      r1.y + r1.height + 1 > r2.y;

    // Функция проверяет, пересекается ли комната с существующим коридором
    const isTouchingCorridor = (room) => {
      // Проверяем границы комнаты и одну клетку вокруг
      for (let y = room.y - 1; y < room.y + room.height + 1; y++) {
        for (let x = room.x - 1; x < room.x + room.width + 1; x++) {
          if (y >= 0 && y < this.tilesY && x >= 0 && x < this.tilesX) {
            if (this.map[y][x] === "empty" &&
                (x === room.x - 1 || x === room.x + room.width ||
                 y === room.y - 1 || y === room.y + room.height)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    let attempts = 0;
    while (this.rooms.length < maxRooms && attempts < 200) {
      const width = roomMinSize + Math.floor(Math.random() * (roomMaxSize - roomMinSize + 1));
      const height = roomMinSize + Math.floor(Math.random() * (roomMaxSize - roomMinSize + 1));
      const x = 1 + Math.floor(Math.random() * (this.tilesX - width - 2));
      const y = 1 + Math.floor(Math.random() * (this.tilesY - height - 2));
      const newRoom = { x, y, width, height };

      // Если это первая комната или комната примыкает к коридору
      if (this.rooms.length === 0 || isTouchingCorridor(newRoom)) {
        if (!this.rooms.some(r => isOverlapping(r, newRoom))) {
          this.rooms.push(newRoom);
          for (let i = y; i < y + height; i++) {
            for (let j = x; j < x + width; j++) {
              this.map[i][j] = "empty";
            }
          }
        }
      }
      attempts++;
    }
  }
  
  createHTunnel(x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      this.map[y][x] = "empty";
    }
  }

  connectRooms() {
    // Создаем 3-5 горизонтальных коридоров
    const horizontalCorridors = 3 + Math.floor(Math.random() * 3); // 3-5 коридоров
    // узнаем длину для участка, где поставить коридор
    const corridorsPeriodY = this.tilesY / horizontalCorridors
    
    for (let i = 0; i < horizontalCorridors; i++) {
      // Выбираем случайную координату Y для коридора при том на каждом из равномерных участков для каждого коридора
      const y = Math.floor(Math.random() * (corridorsPeriodY) + corridorsPeriodY * i)
      // Создаем коридор через всю ширину карты
      this.createHTunnel(0, this.tilesX - 1, y);
    }

    // Создаем 3-5 вертикальных коридоров
    const verticalCorridors = 3 + Math.floor(Math.random() * 3); // 3-5 коридоров
    // узнаем длину для участка, где поставить коридор
    const corridorsPeriodX = this.tilesX / verticalCorridors
    
    for (let i = 0; i < verticalCorridors; i++) {
      // Выбираем случайную координату Y для коридора при том на каждом из равномерных участков для каждого коридора
      const x = Math.floor(Math.random() * (corridorsPeriodX) + corridorsPeriodX * i)
      // Создаем коридор через всю высоту карты
      this.createVTunnel(0, this.tilesY - 1, x);
    }
  }



  createVTunnel(y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      this.map[y][x] = "empty";
    }
  }

  findEnemyAt(x, y) {
    return this.enemies.find((enemy) => enemy.x === x && enemy.y === y) || null;
  }

  setupControls() {
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
    }

    this.keydownHandler = (e) => {
      const prevX = this.player.x;
      const prevY = this.player.y;
      let newX = this.player.x;
      let newY = this.player.y;

      switch (e.code) {
        case "KeyW":
          e.preventDefault();
          newY--;
          break;
        case "KeyS":
          e.preventDefault();
          newY++;
          break;
        case "KeyA":
          e.preventDefault();
          newX--;
          break;
        case "KeyD":
          e.preventDefault();
          newX++;
          break;
        case "Space":
          e.preventDefault();
          this.attackEnemies();
          return;
      }

      if (
        newX >= 0 &&
        newX < this.tilesX &&
        newY >= 0 &&
        newY < this.tilesY &&
        !this.map[newY][newX].startsWith("tileW")
      ) {
        const tile = this.map[newY][newX];
        if (tile === "tileHP") {
          this.player.health = Math.min(
            this.player.health + 20,
            this.player.maxHealth
          );
          this.renderer.updatePlayerHealth();
          console.log("Собрали зелье, здоровье:", this.player.health);
        } else if (tile === "tileSW") {
          this.player.attack += 5;
          this.player.hasSword = true;
          console.log("Собрали меч, атака:", this.player.attack);
        } else if (tile === "tileE" || tile === "tileE_HP") {
          this.fightEnemy(newX, newY);
          return;
        }
        this.map[this.player.y][this.player.x] = "empty";
        this.player.x = newX;
        this.player.y = newY;
        this.map[newY][newX] = "tileP";

        this.renderer.renderMap(this.map);
        // Ход врагов только если координаты реально изменились
        const moved = prevX !== this.player.x || prevY !== this.player.y;
        if (moved) {
          this.moveEnemies();
        }
        this.checkGameOver();
      }
    };
    document.addEventListener("keydown", this.keydownHandler);
  }
  
  attackEnemies() {
    const dirs = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];
    let attacked = false;
    dirs.forEach(([dx, dy]) => {
      const targetX = this.player.x + dx;
      const targetY = this.player.y + dy;
      const enemy = this.findEnemyAt(targetX, targetY);
      if (enemy) {
        enemy.health -= this.player.attack;
        if (enemy.health <= 0) {
          this.enemies = this.enemies.filter((e) => e !== enemy);
          const wasOnPotion = this.map[enemy.y][enemy.x] === "tileE_HP";
          this.map[enemy.y][enemy.x] = wasOnPotion ? "tileHP" : "empty";
          this.renderer.updateTile(
            enemy.x,
            enemy.y,
            wasOnPotion ? "tileHP" : "tile-empty"
          );
        } else {
          this.renderer.updateTile(enemy.x, enemy.y, "tileE");
        }
        attacked = true;
      }
    });
    if (!attacked) {
      // no target adjacent
    }
    // Ответная атака врагов в этот же ход: все соседи наносят урон суммарно
    const adjacentEnemies = this.enemies.filter(
      (e) => Math.abs(e.x - this.player.x) + Math.abs(e.y - this.player.y) === 1
    );
    if (adjacentEnemies.length > 0) {
      const totalDamage = adjacentEnemies.reduce(
        (sum, e) => sum + (typeof e.attack === "number" ? e.attack : 10),
        0
      );
      this.player.health -= totalDamage;
      this.renderer.updatePlayerHealth();
    }
    this.checkGameOver();
  }
}
window.onload = () => {
  const game = new Game();
  game.init();
};
