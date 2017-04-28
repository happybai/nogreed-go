//react
import React, { Component } from 'react'
import PropTypes from 'prop-types'
//import { IntlProvider, FormattedMessage, addLocaleData } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import ReactPaginate from 'react-paginate'
import { push } from 'react-router-redux'
import _ from 'lodash'

//internal component
import { fetchKifus, fetchTopPlayers } from '../actions/FetchActions'
import { setKifuFilter } from '../actions/Actions'
import FilterBar from '../components/FilterBar'

//external component
import { StyleSheet, css } from 'aphrodite'

class Kifus extends Component {

  static propTypes = {
    kifus: PropTypes.object.isRequired,
    players: PropTypes.object.isRequired,
    location: PropTypes.object,
    dispatch: PropTypes.func,
    kifuFilter: PropTypes.string,
  }

  state = {
    isLoading: false,
    filterOpen: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
    }
    let { query } = this.props.location
    this.props.dispatch(fetchKifus({
      page: query.page,
      player: this.state.kifuFilter,
      per_page: 24,
    }))
    this.props.dispatch(fetchTopPlayers(10))
    this.getRecordData()

    this.handleSeeMore = this.handleSeeMore.bind(this)
  }

  handleToggle() {
    this.setState({filterOpen: !this.state.filterOpen})
  }

  getRecordData(page = 1) {
    this.props.dispatch(fetchKifus({ page: page}))
  }

  handlePageClick(data) {
    let page = data.selected + 1
    this.getRecordData(page)
    this.props.dispatch(push(`/kifus?page=${page}`))
  }

  handlePageChanged(newPage) {
    this.setState({ current: newPage }, () => {
      this.props.dispatch(fetchKifus(this.state.current + 1))
    })
  }

  handleSeeMore(filter, val) {
    this.setState({filterOpen: false})
    this.props.dispatch(setKifuFilter(val || this.props.kifuFilter))
    this.props.dispatch(fetchKifus({
      player: val|| this.props.kifuFilter
    }))
  }

  render() {
    const { kifus, players } = this.props
    if (_.isNil(kifus) || _.isNil(players.data)) return null
    let kifuCards = []
    let pagination, page = 0
    let { query } = this.props.location
    if (query && query.page) {
      page = parseInt(query.page - 1)
    }
    if (this.props.kifus.data !== undefined) {
      let pageCount = this.props.kifus.data.total_pages
      if (pageCount > 1) {
        pagination = <ReactPaginate disableInitialCallback={true}
                                    initialPage={page}
                                    previousLabel={'previous'}
                                    nextLabel={'next'}
                                    breakLabel={<a href="">...</a>}
                                    breakClassName={'break-me'}
                                    pageCount={pageCount}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
                                    onPageChange={::this.handlePageClick}
                                    containerClassName={'pagination'}
                                    subContainerClassName={'pages pagination'}
                                    activeClassName={'active'} />
      }
    }
    if (!kifus.isFetching && kifus.data != null) {
      kifus.data.data.forEach((i) => {
        kifuCards.push(
          <div key={i.id} className='kifu-card'>
            <Link to={`/kifus/${i.id}`}>
              <img src={i.preview_img.x300.url} />
            </Link>
            <div className='kifu-info'>
              <span>{i.player_b.en_name} <b>VS</b> {i.player_w.en_name}</span>
              <br />
              <span>{`Result: ${i.result}`}</span>
              <br />
              <span>{`Date: ${i.short_date}`}</span>
            </div>
          </div>
        )
      })
    }
    else {
      kifuCards =
        <div className={css(styles.loading)}>
          <i className="fa fa-spinner fa-pulse fa-fw"></i>
        </div>
    }
    return (
      <div>
        <FilterBar data={[{
          name: 'Player',
          tags: ['all', ...players.data.map(player => player.en_name)],
          filterName: 'playerFilter',
          filterVal: this.props.kifuFilter,
          handleSeeMore: this.handleSeeMore,
        }]} />
        <div className={css(styles.puzzleContent)}>
          { kifuCards }
        </div>
        <div className='clearfix'></div>
        <div>
          { pagination }
        </div>
        <div className='clearfix'></div>
      </div>
    )
  }

}

const styles = StyleSheet.create({

  loading: {
    fontSize: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: '0 auto',
  },

})


function select(state) {
  return {
    kifus: state.kifus,
    players: state.players,
    kifuFilter: state.kifuFilter
  }
}

export default connect(select)(Kifus)
