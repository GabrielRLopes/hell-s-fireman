const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const dpr = 2

canvas.width = 1024 * dpr
canvas.height = 576 * dpr

const oceanLayerData = {
  l_New_Layer_1: l_New_Layer_1,
}

const brambleLayerData = {
  l_New_Layer_2: l_New_Layer_2,
}

const layersData = {
  l_New_Layer_8: l_New_Layer_8,
  l_Back_Tiles: l_Back_Tiles,
  l_Decorations: l_Decorations,
  l_Front_Tiles: l_Front_Tiles,
  l_Shrooms: l_Shrooms,
  l_Collisions: l_Collisions,
  l_Grass: l_Grass,
  l_Trees: l_Trees,
}

const tilesets = {
  l_New_Layer_1: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_New_Layer_2: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_New_Layer_8: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Back_Tiles: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Decorations: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Front_Tiles: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Shrooms: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Collisions: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Grass: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Trees: { imageUrl: './images/decorations.png', tileSize: 16 },
}

// Tile setup
const collisionBlocks = []
const platforms = []
const blockSize = 16

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        }),
      )
    }
  })
})

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const srcX = ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize
        const srcY =
          Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize

        context.drawImage(
          tilesetImage,
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize,
          x * 16,
          y * 16,
          16,
          16,
        )
      }
    })
  })
}

const renderStaticLayers = async (layersData) => {
  const blockSize = 16
  let mapWidth = 0
  let mapHeight = 0

  for (const layer in layersData) {
    const data = layersData[layer]
    if (data && data.length > 0) {
      const currentHeight = data.length * blockSize
      if (currentHeight > mapHeight) {
        mapHeight = currentHeight
      }

      if (data[0] && data[0].length > 0) {
        const currentWidth = data[0].length * blockSize
        if (currentWidth > mapWidth) {
          mapWidth = currentWidth
        }
      }
    }
  }

  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = mapWidth
  offscreenCanvas.height = mapHeight
  const offscreenContext = offscreenCanvas.getContext('2d')

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl)
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  return offscreenCanvas
}

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  arrowLeft: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  arrowRight: {
    pressed: false,
  }
}

let lastTime = performance.now()
let camera = {
  x: 0,
  y: 0,
}

const SCROLL_POST_RIGHT = 330
const SCROLL_POST_TOP = 100
const SCROLL_POST_BOTTOM = 220
let oceanBackgroundCanvas = null
let brambleBackgroundCanvas = null
let gems = []
let gemUI = new Sprite({
  x: 13,
  y: 36,
  width: 15,
  height: 13,
  imageSrc: './images/gem.png',
  spriteCropbox: {
    x: 0,
    y: 0,
    width: 15,
    height: 13,
    frames: 5,
  },
})
let gemCount = 0

function init() {
  gems = []
  gemCount = 0
  gemUI = new Sprite({
    x: 13,
    y: 36,
    width: 15,
    height: 13,
    imageSrc: './images/gem.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 15,
      height: 13,
      frames: 5,
    },
  })

  l_Gems.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 18) {
        gems.push(
          new Sprite({
            x: x * 16,
            y: y * 16,
            width: 15,
            height: 13,
            imageSrc: './images/gem.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 15,
              height: 13,
              frames: 5,
            },
            hitbox: {
              x: x * 16,
              y: y * 16,
              width: 15,
              height: 13,
            },
          }),
        )
      }
    })
  })

  // Posição incial do Player
  player = new Player({
    x: 100,
    y: 100,
    size: 32,
    velocity: { x: 0, y: 0 },
  })
  projectiles = []
  eagles = [
    new Eagle({
      x: 816,
      y: 172,
      width: 40,
      height: 41,
    }),
  ]

  oposums = [
    new Oposum({
      x: 450,
      y: 100,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 600,
      y: 100,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 650,
      y: 100,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 890,
      y: 150,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 906,
      y: 515,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 1150,
      y: 515,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 1663,
      y: 200,
      width: 36,
      height: 28,
    }),
  ]

  sprites = []
  hearts = [
    new Heart({
      x: 10,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 33,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 56,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
  ]

  camera = {
    x: 0,
    y: 0,
  }
}

function animate(backgroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now()
  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime

  // Atualiza a posição do player
  player.handleInput(keys)
  player.update(deltaTime, collisionBlocks)

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.update(deltaTime);

    // Remover projéteis fora da tela
    if (projectile.x < 0 || projectile.x > canvas.width) {
        projectiles.splice(i, 1);
        continue
    }
  
    // Verifica colisão com inimigos (oposums)
    for (let j = oposums.length - 1; j >= 0; j--) {
      const oposum = oposums[j];
      if (projectile.hitbox && oposum.hitbox) {
        if (checkCollisions(projectile, oposum)) {
          sprites.push(
            new Sprite({
              x: oposum.x,
              y: oposum.y,
              width: 32,
              height: 32,
              imageSrc: './images/enemy-death.png',
              spriteCropbox: {
                x: 0,
                y: 0,
                width: 40,
                height: 41,
                frames: 6,
              },
            })
          );
          oposums.splice(j, 1);
          projectiles.splice(i, 1);
          break;
        }
      }  
    }
    // Verifica colisão com inimigos (eagles)
    for (let j = eagles.length - 1; j >= 0; j--) {
      const eagle = eagles[j];
      if (projectile.hitbox && eagle.hitbox) {
        if (checkCollisions(projectile, eagle)) {
          sprites.push(
            new Sprite({
              x: eagle.x,
              y: eagle.y,
              width: 32,
              height: 32,
              imageSrc: './images/enemy-death.png',
              spriteCropbox: {
                x: 0,
                y: 0,
                width: 40,
                height: 41,
                frames: 6,
              },
            })
          );
          eagles.splice(j, 1);
          projectiles.splice(i, 1);
          break;
        }
      }  
    }
    // Verifica colisão com paredes. Não está funcionando ainda
    for (let j = 0; j < collisionBlocks.length; j++) {
      const collisionBlock = collisionBlocks[j];
      if (projectile.hitbox && collisionBlock.hitbox) {
        if (checkCollisions(projectile, collisionBlock)) {
          projectiles.splice(i, 1)
          break
        }
      }
    }
  }

  // Update oposum position
  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i]
    oposum.update(deltaTime, collisionBlocks)

    // Tomar dano ao encostar no inimigo
    const collisionDirection = checkCollisions(player, oposum)
    if (collisionDirection) {
      if (
        collisionDirection === 'left' ||
        collisionDirection === 'right' ||
        collisionDirection === 'top'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
          player.setIsInvincible()
        } else if (fullHearts.length === 0) {
          init()
        }
      }
    }
  }

  // Update eagle position
  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.update(deltaTime, collisionBlocks)

    // Tomar dano ao encostar no inimigo
    const collisionDirection = checkCollisions(player, eagle)
    if (collisionDirection) {
      if (
        collisionDirection === 'left' ||
        collisionDirection === 'right' ||
        collisionDirection === 'top'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
          player.setIsInvincible()
        } else if (fullHearts.length === 0) {
          init()
        }
      }
    }
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i]
    sprite.update(deltaTime)

    if (sprite.iteration === 1) {
      sprites.splice(i, 1)
    }
  }

  // Coleta das gotas de água
  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i]
    gem.update(deltaTime)

    const collisionDirection = checkCollisions(player, gem)
    if (collisionDirection) {
      // Feedback de coleta das gotas de água
      sprites.push(
        new Sprite({
          x: gem.x - 8,
          y: gem.y - 8,
          width: 32,
          height: 32,
          imageSrc: './images/item-feedback.png',
          spriteCropbox: {
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            frames: 5,
          },
        }),
      )

      // Remove as gemas da tela
      gems.splice(i, 1)
      gemCount++

      if (gems.length === 0) {
        console.log('YOU WIN!')
      }
    }
  }

  if (player.x > SCROLL_POST_RIGHT && player.x < 1680) {
    const scrollPostDistance = player.x - SCROLL_POST_RIGHT
    camera.x = scrollPostDistance
  }

  if (player.y < SCROLL_POST_TOP && camera.y > 5850) {
    const scrollPostDistance = SCROLL_POST_TOP - player.y
    camera.y = scrollPostDistance
  }

  if (player.y > SCROLL_POST_BOTTOM) {
    const scrollPostDistance = player.y - SCROLL_POST_BOTTOM
    camera.y = -scrollPostDistance
  }

  // Limita a câmera para não ultrapassar as bordas do mapa
  const logicalViewportHeight = canvas.height / (dpr + 1);
  const mapHeight = 108 * 16;
  const maxCameraY = -(mapHeight - logicalViewportHeight);

  if (camera.y < maxCameraY) {
    camera.y = maxCameraY;
  }
  // Impede que a câmera suba além do topo do mapa
  if (camera.y > 0) {
    camera.y = 0;
  }

  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)

  c.save()
  c.scale(dpr + 1, dpr + 1)

  c.drawImage(oceanBackgroundCanvas, -camera.x * 0.32, camera.y * 0.32)

  c.drawImage(brambleBackgroundCanvas, -camera.x * 0.16, camera.y * 0.16)

  // Mundo principal do jogo
  c.save()
  c.translate(-camera.x, camera.y) // Move o mundo do jogo
  c.drawImage(backgroundCanvas, 0, 0)
  player.draw(c)

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.draw(c);
  }

  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i]
    oposum.draw(c)
  }

  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.draw(c)
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i]
    sprite.draw(c)
  }

  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i]
    gem.draw(c)
  }
  c.restore()

  c.restore()

  c.save()
  c.scale(dpr + 1, dpr + 1)
  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i]
    heart.draw(c)
  }

  gemUI.draw(c)
  c.fillText(gemCount, 33, 46)
  c.restore()

  requestAnimationFrame(() => animate(backgroundCanvas))
}

const startRendering = async () => {
  try {
    oceanBackgroundCanvas = await renderStaticLayers(oceanLayerData)
    brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData)
    const backgroundCanvas = await renderStaticLayers(layersData)
    if (!backgroundCanvas) {
      console.error('Failed to create the background canvas')
      return
    }

    animate(backgroundCanvas)
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}

init()
startRendering()
