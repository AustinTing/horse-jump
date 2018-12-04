const fs = require('fs')
const _ = require('lodash')

const write = (() => {
  let times = 0
  return content => {
    content = times + '\n' + content
    times = times + 1
    return fs.appendFileSync('./result.txt', content + '\n')
  }
})()

const initBoard = () => {
  let board = []
  for (let i = 0; i < 9; i++) {
    board[i] = []
    for (let j = 0; j < 9; j++) {
      board[i][j] = null
    }
  }
  return board
}

const formatBoard = board => {
  let thisBoard = _.cloneDeep(board)
  let fixBoard = ''
  for (let i = 0; i < 9; i++) {
    let border = ''
    for (let j = 0; j < 9; j++) {
      if (_.isNull(thisBoard[i][j])) {
        thisBoard[i][j] = ' .'
      }
      let num = thisBoard[i][j]
      num = num < 10 ? ' ' + num : num
      let numBorder = j === 8 ? (num + '\n') : (num + ' - ')
      fixBoard = fixBoard + numBorder
      border = border + ' |   '
    }
    fixBoard = fixBoard + border + '\n'
  }
  return fixBoard
}
const sleep = milliseconds => {
  return new Promise((resolve, reject) => {
    var now = new Date().getTime()
    while (new Date().getTime() < now + milliseconds) {
    }
    resolve()
  })
}

var stepChoices = []
const jump = (() => {
  let bingoTime = 0
  return async (board, i, j, step) => {
    if (i < 0 || i > 8 || j < 0 || j > 8) {
      return
    }
    if (board[i][j]) return
    // await sleep(1000)
    let prefixStep = step < 10 ? ' ' + step : step
    board[i][j] = '\x1b[43m' + prefixStep + '\x1b[0m'
    console.log(formatBoard(board))
    board[i][j] = step
    let nextStep = step + 1
    let nextI
    let nextJ
    nextI = i + 1
    nextJ = j + 2
    stepChoices[step] = 0
    await jump(board, nextI, nextJ, nextStep)
    nextI = i + 2
    nextJ = j + 1
    stepChoices[step] = 1
    await jump(board, nextI, nextJ, nextStep)
    nextI = i + 2
    nextJ = j - 1
    stepChoices[step] = 2
    await jump(board, nextI, nextJ, nextStep)
    nextI = i + 1
    nextJ = j - 2
    stepChoices[step] = 3
    await jump(board, nextI, nextJ, nextStep)
    nextI = i - 1
    nextJ = j - 2
    stepChoices[step] = 4
    await jump(board, nextI, nextJ, nextStep)
    nextI = i - 2
    nextJ = j - 1
    stepChoices[step] = 5
    await jump(board, nextI, nextJ, nextStep)
    nextI = i - 2
    nextJ = j + 1
    stepChoices[step] = 6
    await jump(board, nextI, nextJ, nextStep)
    nextI = i - 1
    nextJ = j + 2
    stepChoices[step] = 7
    await jump(board, nextI, nextJ, nextStep)
    // console.log(`now step: ${step}, position: ${i}${j}, no next steps`)
    for (let m = 0; m < 9; m++) {
      for (let n = 0; n < 9; n++) {
        if (_.isNull(board[m][n])) {
          // console.log(stepChoices.toString())
          board[i][j] = null
          stepChoices = _.initial(stepChoices)
          // bingoTime = bingoTime + 1
          // write(bingoTime + '\n')
          return
        }
      }
    }
    console.log(`Bingo!`)
    bingoTime = bingoTime + 1
    console.log(formatBoard(board))
    write(formatBoard(board))
  }
}
)()

const run = async () => {
  let board = initBoard()
  // for (let i = 0; i < 9; i++) {
  //   for (let j = 0; j < 9; j++) {
  //     board[i][j] = '' + 0 + 0

  //   }
  // }
  let i = 0
  let j = 0
  let step = 0
  jump(board, i, j, step)
}

run()
