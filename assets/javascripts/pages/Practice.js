import React, { Component, PropTypes } from 'react'
import _ from 'lodash'

import mainStyles from '../styles/main'
import { connect } from 'react-redux'

//external component
import { StyleSheet, css } from 'aphrodite'
import PuzzleList from '../presentations/PuzzleList'
import { fetchPractice } from '../actions/FetchActions'
import { setPracticePuzzleId } from '../actions/Actions'
import PuzzleBoard from '../presentations/PuzzleBoard'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import { postPuzzleRecord, postPracticeRecord } from '../actions/PostActions'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'

import Favorite from 'material-ui/svg-icons/action/favorite'
import FavoriteBorder from 'material-ui/svg-icons/action/favorite-border'


class Practice extends Component {

  state = {
    pause: true,
    intervalId: null,
    time: 60,
    life: 5,
    record: []
  }

  constructor(props) {
    super(props)
  }

  nextPuzzle() {
    let puzzleCount = this.props.practice.data.puzzles.length
    if (this.state.record.length < puzzleCount) {
      for (let i = 0; i < puzzleCount; i++) {
        let record = _.find(this.state.record, {index: i})
        if (record === undefined) {
          this.props.dispatch(setPracticePuzzleId(this.props.practice.data.puzzles[i].id))
          this.handlePanelReset()
          return;
        }
      }
    } else {
      clearInterval(this.state.intervalId)
      const { auth } = this.props
      let rightRecords = _.find(this.state.record, {isRight: true}) || []
      let rightCount = rightRecords.length
      let profile = auth.getProfile()
      this.props.dispatch(postPracticeRecord({
        right_count: rightCount,
        wrong_count: puzzleCount - rightCount,
        puzzle_count: puzzleCount,
        total_time: 0,
        practice_id: this.props.practice.data.id,
        user_id: profile.id,
        results: this.state.record,
      }))
    }
  }

  prevPuzzle() {
    let index = this._getCurrentPuzzleIndex()
    if (index > 0) {
      this.props.dispatch(setPracticePuzzleId(this.props.practice.data.puzzles[index - 1].id))
    } else {
      console.log('top')
    }
  }

  buildPracticeRecord(isRight) {
    let puzzle = this._getCurrentPuzzle()
    this.state.record.push({
      puzzle_id: puzzle.id,
      index: this._getCurrentPuzzleIndex(),
      isRight: isRight
    })
  }

  handleAfterClick() {
    this.handleTimeReset()
  }

  handleClick(id) {
    this.props.dispatch(setPracticePuzzleId(id))
  }

  handleRight() {
    this.buildPracticeRecord(true)
    this._handlePuzzleRecord('right')
    clearInterval(this.state.intervalId)
    this.refs.board.handleRightTipOpen()
    setTimeout(() => {
      this.handleTimeReset()
      this.handleReset()
      this.nextPuzzle()
    }, 2000)
  }

  handleWrong(isRecord = true) {
    if (isRecord) {
      this._handlePuzzleRecord('wrong')
    }
    clearInterval(this.state.intervalId)
    this.refs.board.handleWrongTipOpen()
    this.minusLife()
    setTimeout(() => {
      this.handleTimeReset()
      this.handleReset()
      if (this.state.life === 0) {
        this.buildPracticeRecord(false)
        this.nextPuzzle()
      }
      else {
        this.setState({
          intervalId: setInterval(::this.timer, 1000),
        })
      }
    }, 2000)
  }

  handleReset() {
    this.refs.board.handleTipsReset()
    this.refs.board.reset()
  }

  handleTimeReset() {
    this.setState({ time: this.props.practice.data.time })
  }

  handlePanelReset() {
    this.setState({
      time: this.props.practice.data.time,
      life: this.props.practice.data.life,
      intervalId: setInterval(::this.timer, 1000),
    })
  }

  handlePause() {
    clearInterval(this.state.intervalId)
    this.setState({ pause: true })
  }

  handleGo() {
    this.setState({
      pause: false,
      intervalId: setInterval(::this.timer, 1000)
    })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId)
  }

  minusLife() {
    this.setState((prevState, props) => {
      if (prevState.life > 0) {
        return { life: prevState.life - 1 }
      }
    })
  }

  timer() {
    this.setState((prevState, props) => {
      let time = prevState.time
      if (time > 0) {
        time --
      } else {
        this.handleWrong(false)
      }
      return { time: time }
    })
  }

  componentDidMount() {
    let { id } = this.props.params
    this.props.dispatch(fetchPractice({id})).then(() => {
      this.setState({
        life: this.props.practice.data.life,
        time: this.props.practice.data.time,
      })
    })
  }


  render() {
    const actions = [
          <FlatButton
            label="GO"
            primary={true}
            onTouchTap={::this.handleGo}
          />
        ]
    let puzzleList, puzzle, puzzleBoard, whofirst, rank, favorite
    if (this.props.practice.data !== undefined) {
      puzzle = this._getCurrentPuzzle()
      puzzleList = <PuzzleList puzzleListOnClick={::this.handleClick}
        puzzleList={this.props.practice.data.puzzles}
        currentPuzzleId={puzzle.id}
        record={this.state.record}
      />
      puzzleBoard = <PuzzleBoard
        className="board"
        researchMode={this.state.researchMode}
        whofirst={puzzle.whofirst}
        puzzle={puzzle.steps}
        right_answers={puzzle.right_answers}
        wrong_answers={puzzle.wrong_answers}
        answers={puzzle.answers}
        handleRight={::this.handleRight}
        handleWrong={::this.handleWrong}
        afterClickEvent={::this.handleAfterClick}
        ref="board" />

      whofirst = <h1 className={css(styles.title)}>{puzzle.whofirst}</h1>
      rank = <h1 className={css(styles.title)}>{puzzle.rank}</h1>
      favorite = []
      for (let i = 0; i < this.state.life; i++) {
        favorite.push(<Favorite key={`fav-${i}`} className={css(styles.favorite)} />)
      }
      for (let i = 0; i < this.props.practice.data.life - this.state.life; i++) {
        favorite.push(<FavoriteBorder key={`fav-b-${i}`} className={css(styles.favorite)} />)
      }
    }
    return (
      <div className={css(mainStyles.mainContainer)}>
        <Dialog
          bodyStyle={{fontSize: '24px'}}
          title="Ready"
          overlayStyle={{filter: 'blur(5px)'}}
          actions={actions}
          modal={true}
          open={this.state.pause}
        >
          Are you ready?
        </Dialog>
        <Paper className={css(styles.list)}>
          { puzzleList }
        </Paper>
        <Paper className={css(styles.board)}>
          { puzzleBoard }
        </Paper>
        <Paper className={css(styles.panel)}>
          <div>
            { whofirst }
          </div>
          <Divider />
          <div>
            { rank }
          </div>
          <Divider />
          <div>
            <h1 className={css(styles.title)}>Life: </h1>
            { favorite }
          </div>
          <div>
            <h1 className={css(styles.title)}>Time Left:</h1>
            <div className={css(styles.title)}>{`${ this.state.time }s`}</div>
          </div>
          <Divider />
          <div>
            <RaisedButton
              onClick={::this.handlePause}
              label="Pause"
              primary={true}
            />
          </div>
        </Paper>
      </div>
    )
  }

  _handlePuzzleRecord(type) {
    const { auth } = this.props
    let profile = auth.getProfile()
    let puzzle = this._getCurrentPuzzle()

    this.props.dispatch(postPuzzleRecord({
      puzzle_id: puzzle.id,
      user_id: profile.user_id,
      record_type: type
    }))
  }

  _getCurrentPuzzleIndex() {
    return _.findIndex(this.props.practice.data.puzzles, { id: this.props.currentPuzzleId || this.props.practice.data.puzzles[0].id })
  }

  _getCurrentPuzzle() {
    return _.find(this.props.practice.data.puzzles, {id: this.props.currentPuzzleId || this.props.practice.data.puzzles[0].id})
  }

}

const styles = StyleSheet.create({

  list: {
    display: 'flex',
    height: 'calc(100vmin - 100px)',
    overflow: 'hidden',
    overflowY: 'visible',
  },

  board: {
    flex: '1 1 auto',
    width: 'calc(100vmin - 100px)',
    height: 'calc(100vmin - 100px)',
    marginLeft: '20px',
  },

  panel: {
    padding: '20px',
    flex: '0 0 270px',
    height: 'calc(100vmin - 100px)',
    marginLeft: '20px',
  },

  favorite: {
    width: '30px',
    height: '30px',
    color: 'red',
  },

  title: {
    fontSize: '24px'
  }

})

function select(state) {
  return {
    currentPuzzleId: state.practicePuzzleId,
    practice: state.practice
  }
}

export default connect(select)(Practice)