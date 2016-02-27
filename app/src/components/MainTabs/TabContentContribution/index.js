import React from 'react'

import List from 'material-ui/lib/lists/list'
import ListItem from 'material-ui/lib/lists/list-item'
import Divider from 'material-ui/lib/divider'
import Avatar from 'material-ui/lib/avatar'
import Colors from 'material-ui/lib/styles/colors'
import FontIcon from 'material-ui/lib/font-icon'
import IconButton from 'material-ui/lib/icon-button'

import moment from 'moment'

import Filter from '../../Filter'
import { MainColors, SameColor, BatteryIconTypes, BatteryColors, } from '../../../theme'
import { sortRecentItemByDate, } from '../../../util'
import Contribution from './Contribution'

import css from './index.css'

const styles = {
  title: {
    fontSize: 22,
    marginTop: 35,
    fontWeight: 200,
  },

  table: {
    container: { marginTop: 20, },
    headerColumn: { paddingLeft: 0, },
    rowColumn: { borderRadius: 0, verticalAlign: 'baseline', },
  },

  list: {
    container: { marginTop: 15, marginBottom: 30, },
    itemLeftIcon: {
      paddingLeft: 15,
      paddingTop: 2,
    },

    batteryIcon: {
      /** do not remove paddingTop to preserve middle position */
      paddingLeft: 2, paddingTop: 0,
      width: 25,
      cursor: 'default',
    },

    batteryIconContainer: {
      float: 'left',
    },

    since: {
      float: 'left',
    },
  },
}

const TABLE_COLUMN_LAYOUT = {
  ColumnDate: 'col s3 m2',
  ColumnRepository: 'col s5 m6',
  ColumnRecentCommit: 'col s4 m4',
}

export default class TabContentContribution extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filterKeyword: '', /** used to filter */
      login: '',         /** user.login */
      contributions: [], /** caching contribs to avoid sorting, filtering every time */
    }
  }

  componentWillReceiveProps(nextProps) {
    const { activities, user, } = nextProps

    /** 1. sort */
    const sorted = activities.slice().sort((activity1, activity2) => {
      return sortRecentItemByDate(activity1.created_at, activity2.created_at)
    })

    /** 2. unique by recent repo (e.g `apache/kafka`) */
    let uniqActivitiesByRepo = new Map()
    sorted
      .filter(activity => activity.type === 'PushEvent')
      .filter(activity => {
        const [ owner, ] = activity.repo.split('/')
        return (user.login != owner)
      })
      .map(activity => {
        /** already sorted */
        if (uniqActivitiesByRepo.get(activity.repo) === void 0)
          uniqActivitiesByRepo.set(activity.repo, activity)
      })

    let filtered = Array.from(uniqActivitiesByRepo.values())

    // TODO filterKeyword

    const contribs = TabContentContribution.activitiesToContributions(filtered)

    this.setState({contributions: contribs, login: user.login, })
  }

  handleFilterChange(event) {
    const filterKeyword = event.target.value.trim().toLowerCase()
    this.setState({ filterKeyword: filterKeyword, })
  }

  /** convert `PushEvent` to contribution except commits to his own repos */
  static activitiesToContributions(activities) {
    if (activities === void 0) return []

    return activities.map(activity => {
      const [ owner, repository, ] = activity.repo.split('/') /** e.g 'akka/akka */
      const [ refs, heads, branch, ] = activity.payload.ref.split('/') /** e.g 'refs/heads/master */

      return new Contribution(
        activity.created_at,
        owner,
        repository,
        branch,
        activity.payload.head)
    })
  }

  // CONTRIB 탭 filter 구현하기

  static renderTitle() {
    return (
      <div style={styles.title}>Contribution</div>
    )
  }

  static renderContribItem(index, contrib, login) {
    const { updatedAt, owner, repository, branch, recentCommit, } = contrib

    const fullRepoName = `${owner}/${repository}`
    const commitsUrl = `https://github.com/${fullRepoName}/commits/${branch}?author=${login}`
    const masterBranchCommitsUrl = `https://github.com/${fullRepoName}/commits?author=${login}`

    const now = moment()
    const date = moment(updatedAt)
    const fromNow = date.fromNow()
    const since = Math.floor(moment.duration(now.diff(date)).asDays())

    const batteryIconTypeIndex =
      (since <= 15) ? 4 :
        (since <= 45) ? 3 :
          (since <= 90) ? 2 :
            (since <= 180) ? 1 : 0


    const batteryIcon = (
      <IconButton
        iconStyle={{color: BatteryColors[batteryIconTypeIndex], fontSize: 12,}}
        style={styles.list.batteryIcon}
        linkButton>
        <FontIcon className={`fa ${BatteryIconTypes[batteryIconTypeIndex]}`} />
      </IconButton>
    )

    const secondaryText = (
      <div>
        <div style={styles.list.batteryIconContainer}>{batteryIcon}</div>
        <div style={styles.list.since}>{fromNow}</div>
      </div>
    )

    return (
      <ListItem
        key={index}
        className={css.contribution} /** for hover bg color */
        disabled
        primaryText={<a href={masterBranchCommitsUrl}>{fullRepoName}</a>}
        secondaryText={secondaryText}
        leftIcon={<FontIcon className='fa fa-github' style={styles.list.itemLeftIcon} />}
        primaryTogglesNestedList
        nestedItems={[]}
        />
    )
  }

  static renderContribList(contribs, login) {

    let list = []

    contribs.map((contrib, index) => {
      list.push(TabContentContribution.renderContribItem(index, contrib, login))
      list.push(<Divider key={`divider_${index}`} inset />)
    })

    return(
      <List style={styles.list.container}>
        {list}
      </List>
    )
  }

  // TODO: filter, sorter, paginator
  render() {
    const { user, } = this.props
    const { contributions, filterKeyword, } = this.state

    const filtered = contributions.filter(contrib  => {
      const repo = `${contrib.owner}/${contrib.repository}`.toLowerCase().trim()
      return (repo.includes(filterKeyword))
    })

    return (
      <div className='container'>
        {TabContentContribution.renderTitle()}
        <Filter handler={this.handleFilterChange.bind(this)} floatingLabel='INSERT FILTER' />
        {TabContentContribution.renderContribList(filtered, user.login)}
      </div>
    )
  }

}

TabContentContribution.propTypes = {
  user: React.PropTypes.object.isRequired,
  activities: React.PropTypes.array.isRequired,
}