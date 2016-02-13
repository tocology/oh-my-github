import React, { PropTypes, Component, } from 'react'
import AutoComplete from 'material-ui/lib/auto-complete'
import TextField from 'material-ui/lib/text-field'

import RandomColor from 'randomcolor'

import ProgressBar from '../../ProgressBar'
import { styles, } from './index'

class SectionOtherLangs extends Component {
  constructor(props) {
    super(props)

    this.state = { filterKeyword: '', progressBarColors: [], }
  }

  componentWillReceiveProps(nextProps) {
    const { otherLangs, } = nextProps

    if (otherLangs.length > 0) {
      const colors = RandomColor({luminosity: 'light', hue: 'purple', count: otherLangs.length, }).sort().reverse()
      this.setState({progressBarColors: colors,})
    }
  }

  handleFilterChange(event) {
    this.setState({filterKeyword: event.target.value,})
  }

  renderTitle(langs) {
    return (
      <div> {(langs.length > 0) ? `Other ${langs.length} Languages` : null} </div>
    )
  }

  renderFilter(langs) {
    if (langs.length > 0) {
      return (
        <TextField onChange={this.handleFilterChange.bind(this)}
                   floatingLabelText='Insert Language Which You Want To Find' />
      )
    }
  }

  renderProgressBars(langs) {
    const { filterKeyword, progressBarColors, } = this.state

    let progressBars = []

    for (let i = 0; i < langs.length; i++) {
      const lang = langs[i]
      const progressBar = (<ProgressBar width='100%' color={progressBarColors[i]}
                                       key={lang.name} label={lang.name}
                                       tooltipLabel={`${lang.line}  LINEs`} />)

      if ('' === filterKeyword) { /** if no filter provided, put all progress bars */
        progressBars.push(progressBar)
        continue
      }

      if (lang.name.toLowerCase().startsWith(filterKeyword.toLowerCase())) {
        progressBars.push(progressBar)
      }
    }

    return (<div>{progressBars}</div>)
  }

  render() {
    const { otherLangs, } = this.props

    return (
      <div>
        <div className='col s12' style={styles.sectionRepo}>
          {this.renderTitle(otherLangs)}
        </div>
        <div className='col s12' >
          {this.renderFilter(otherLangs)}
        </div>
        <div className='col s12 center' style={styles.containerProgressBar}>
          {this.renderProgressBars(otherLangs)}
        </div>
      </div>
    )
  }
}

export default SectionOtherLangs

SectionOtherLangs.propTypes = {
  otherLangs: PropTypes.array.isRequired,
}
