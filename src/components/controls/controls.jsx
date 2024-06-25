import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl'

import GreenFlag from '../green-flag/green-flag.jsx'
import StopAll from '../stop-all/stop-all.jsx'
import TurboMode from '../turbo-mode/turbo-mode.jsx'
import { connect } from 'react-redux'
import logo from './../../lib/assets/download.svg'
import localForage from 'localforage';
import styles from './controls.css'

const messages = defineMessages({
  goTitle: {
    id: 'gui.controls.go',
    defaultMessage: 'Go',
    description: 'Green flag button title',
  },
  stopTitle: {
    id: 'gui.controls.stop',
    defaultMessage: 'Stop',
    description: 'Stop button title',
  },
})

const Controls = function (props) {
  const greenFlagRef = React.useRef(null);
  const {
    active,
    className,
    intl,
    onGreenFlagClick,
    onStopAllClick,
    onSpriteFlagClick,
    turbo,
    spriteClicked,
    isFullScreen,
    ...componentProps
  } = props
  // console.log(props.costumeURLFax) // This is the costumeURLFax from mapStateToProps
  return (
    <div className={classNames(styles.controlsContainer, className)} {...componentProps}>
      {!isFullScreen && (
        <div
          className={`${spriteClicked ? styles.spriteIconBg : styles.spriteIcon}`}
          onClick={onSpriteFlagClick}
        >
          <div className={styles.spriteImageOuter}>
            <div className={styles.spriteImageInner}>
              <img className={styles.spriteImage} draggable={false} src={logo} />
            </div>
          </div>
        </div>
      )}

      <div ref={greenFlagRef}  className={styles.redGreenButtons}>
        <GreenFlag
          active={active}
          title={intl.formatMessage(messages.goTitle)}
          onClick={onGreenFlagClick}
        />
        <StopAll
          active={active}
          title={intl.formatMessage(messages.stopTitle)}
          onClick={onStopAllClick}
        />
      </div>
      {turbo ? <TurboMode /> : null}
    </div>
  )
}

Controls.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  intl: intlShape.isRequired,
  onGreenFlagClick: PropTypes.func.isRequired,
  onStopAllClick: PropTypes.func.isRequired,
  turbo: PropTypes.bool,
}

Controls.defaultProps = {
  active: false,
  turbo: false,
}

const mapStateToProps = (state) => ({
  costumeURLFax: state.scratchGui.vmStatus.costumeURLFax,
  spriteClicked: state.scratchGui.vmStatus.spriteClicked,
  isFullScreen: state.scratchGui.mode.isFullScreen,
})

export default injectIntl(connect(mapStateToProps, null)(Controls))
