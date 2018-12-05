const fs = require('fs')
const _ = require('lodash')
const r = require('ramda')

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
  let fixBoard = '   0    1    2    3    4    5    6    7    8\n'
  for (let i = 0; i < 9; i++) {
    let border = '  '
    for (let j = 0; j < 9; j++) {
      if (_.isNull(thisBoard[i][j])) {
        thisBoard[i][j] = ' .'
      }
      if (j === 0) {
        fixBoard = fixBoard + i + ' '
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

const isInBoard = (i, j) => i >= 0 && i <= 8 && j >= 0 && j <= 8

const isValidPosition = (board, i, j) => {
  return isInBoard(i, j) && _.isNull(board[i][j])
}

const countEmptyPosition = board => {
  let count = 0
  _.each(board, row => {
    _.each(row, position => {
      if (_.isNull(position)) {
        count++
      }
    })
  })
  return count
}

const isLonelySpaceExist = board => {
  if (countEmptyPosition(board) === 1 ||
  countEmptyPosition(board) === 2) return false // last one or last two is lonely
  let tempBoard = initBoard()
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (!_.isNull(board[i][j])) continue
      let validPositions = []
      if (isValidPosition(board, i + 2, j + 1)) {
        validPositions.push({ i: i + 2, j: j + 1 })
      }
      if (isValidPosition(board, i + 1, j + 2)) {
        validPositions.push({ i: i + 1, j: j + 2 })
      }
      if (isValidPosition(board, i - 1, j + 2)) {
        validPositions.push({ i: i - 1, j: j + 2 })
      }
      if (isValidPosition(board, i - 2, j + 1)) {
        validPositions.push({ i: i - 2, j: j + 1 })
      }
      if (isValidPosition(board, i - 2, j - 1)) {
        validPositions.push({ i: i - 2, j: j - 1 })
      }
      if (isValidPosition(board, i - 1, j - 2)) {
        validPositions.push({ i: i - 1, j: j - 2 })
      }
      if (isValidPosition(board, i + 1, j - 2)) {
        validPositions.push({ i: i + 1, j: j - 2 })
      }
      if (isValidPosition(board, i + 2, j - 1)) {
        validPositions.push({ i: i + 2, j: j - 1 })
      }
      if (validPositions.length === 0) return true
      if (validPositions.length > 1) continue
      let otherSpace = validPositions[0]
      if (tempBoard[i][j]) {
        // console.log(`Find Double`)
        // console.log(i, j, validPositions)
        // console.log(formatBoard(board))
        return true
      }
      tempBoard[otherSpace.i][otherSpace.j] = 1
    }
  }
  return false
}

const isBingo = board => {
  for (let m = 0; m < 9; m++) {
    for (let n = 0; n < 9; n++) {
      if (_.isNull(board[m][n])) {
        return false
      }
    }
  }
  return true
}

var stepChoices = []
const jump = (() => {
  let jumpTime = 0
  let bingoTime = 0
  return async (board, i, j, step) => {
    // console.log('jump', i, j, step)
    // console.log(stepChoices.toString())
    if (!isValidPosition(board, i, j)) {
      return
    }
    jumpTime++
    // await sleep(300)
    if (jumpTime % 10000000000 === 0) {
      console.log(jumpTime)
      let prefixStep = step < 10 ? ' ' + step : step
      board[i][j] = '\x1b[43m' + prefixStep + '\x1b[0m'
      console.log(formatBoard(board))
    }

    board[i][j] = step
    if (isBingo(board)) {
      console.log(`Bingo!`)
      bingoTime = bingoTime + 1
      console.log(formatBoard(board))
      write(formatBoard(board))
    }
    if (isLonelySpaceExist(board)) {
      board[i][j] = null
      return
    }
    let nextStep = step + 1
    stepChoices[step] = 0
    await jump(board, i + 2, j + 1, nextStep)
    stepChoices[step] = 1
    await jump(board, i + 1, j + 2, nextStep)
    stepChoices[step] = 2
    await jump(board, i - 1, j + 2, nextStep)
    stepChoices[step] = 3
    await jump(board, i - 2, j + 1, nextStep)
    stepChoices[step] = 4
    await jump(board, i - 2, j - 1, nextStep)
    stepChoices[step] = 5
    await jump(board, i - 1, j - 2, nextStep)
    stepChoices[step] = 6
    await jump(board, i + 1, j - 2, nextStep)
    stepChoices[step] = 7
    await jump(board, i + 2, j - 1, nextStep)

    // console.log(`now step: ${step}, position: ${i}${j}, no next steps`)
    for (let m = 0; m < 9; m++) {
      for (let n = 0; n < 9; n++) {
        if (_.isNull(board[m][n])) {
          stepChoices = _.initial(stepChoices)
          board[i][j] = null
          return
        }
      }
    }
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
  await jump(board, i, j, step)
  console.log('done')
}

run()
