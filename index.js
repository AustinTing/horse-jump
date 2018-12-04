const fs = require('fs')
const fsPromises = fs.promises
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
var steps = []

const formatBoard = board => {
  let thisBoard = _.cloneDeep(board)
  let fixBoard = ''
  for (let i = 0; i < 9; i++) {
    let border = ''
    for (let j = 0; j < 9; j++) {
      if (_.isNull(thisBoard[i][j])) {
        thisBoard[i][j] = 'nu'
      }
      let numBorder = j === 8 ? (thisBoard[i][j] + '\n') : (thisBoard[i][j] + ' - ')
      fixBoard = fixBoard + numBorder
      border = border + ' |   '
    }
    fixBoard = fixBoard + border + '\n'
  }
  return fixBoard
}

const jump = (() => {
  let jumpTime = 0
  return (board, i, j, step) => {
    jumpTime++
    if (i < 0 || i > 8 || j < 0 || j > 8) {
      return
    }
    if (board[i][j]) return
    if (_.isUndefined(steps[step])) {
      steps[step] = []
    }
    board[i][j] = steps.length
    let nextStep = step + 1
    let nextI
    let nextJ
    nextI = i + 1
    nextJ = j + 2
    jump(board, nextI, nextJ, nextStep)
    nextI = i + 2
    nextJ = j + 1
    jump(board, nextI, nextJ, nextStep)
    nextI = i + 2
    nextJ = j - 1
    jump(board, nextI, nextJ, nextStep)
    nextI = i + 1
    nextJ = j - 2
    jump(board, nextI, nextJ, nextStep)
    nextI = i - 1
    nextJ = j - 2
    jump(board, nextI, nextJ, nextStep)
    nextI = i - 2
    nextJ = j - 1
    jump(board, nextI, nextJ, nextStep)
    nextI = i - 2
    nextJ = j + 1
    jump(board, nextI, nextJ, nextStep)
    nextI = i - 1
    nextJ = j + 2
    jump(board, nextI, nextJ, nextStep)
    if (jumpTime % 10000000 === 0) {
      console.log(jumpTime)
      console.log(formatBoard(board))
    }
    for (let m = 0; m < 9; m++) {
      for (let n = 0; n < 9; n++) {
        if (_.isNull(board[m][n])) {
          board[i][j] = null
          steps = _.initial(steps)
          return
        }
      }
    }
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
  console.log('done')
}

run()
