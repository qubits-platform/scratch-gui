import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl'

import GreenFlag from '../green-flag/green-flag.jsx'
import StopAll from '../stop-all/stop-all.jsx'
import TurboMode from '../turbo-mode/turbo-mode.jsx'
import { connect } from 'react-redux'
import logo from './../../lib/assets/download.svg'
import styles from './controls.css'
import Reload from '../customi-cons/reload.jsx';

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
    currentLayout,
    handleGreenbuttonClick,
    ...componentProps
  } = props


  const handleReload = () => {
    window.parent.postMessage('reloadIframe', '*');
  };

  return (
    <div className={classNames(currentLayout==='student'&&styles.controlsContainerStudent|| currentLayout==='teacher'&&styles.controlsContainerTeacher||currentLayout==='normal'&&styles.controlsContainer, className)} {...componentProps}>
      
      {!isFullScreen && (
        <div
          className={
            currentLayout === 'student' ? (spriteClicked?styles.spriteIconBgStudent:styles.spriteIconBgStudentHide) :
            currentLayout === 'teacher' ? (spriteClicked?styles.spriteIconBgTeacher:styles.spriteIconBgTeacherHide) :
            `${spriteClicked ? styles.spriteIconBg : styles.spriteIconHide}`
          }
          onClick={onSpriteFlagClick}
        >
          <div className={styles.spriteImageOuter}>
              <img className={styles.spriteImage} draggable={false} src={logo} />
          </div>
        </div>
      )}

      <div onClick={handleReload} className={styles.reloadButton}><Reload /></div>

      {currentLayout!=='teacher' && <div onClick={handleGreenbuttonClick} className={styles.greenButton}>
        <div >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="green" class="size-5">
            <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
          </svg>
        </div>
      </div>}


      <div ref={greenFlagRef} className={styles.redGreenButtons}>
     
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
