import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames'
import VM from 'scratch-vm'

import Box from '../box/box.jsx'
import { STAGE_DISPLAY_SIZES } from '../../lib/layout-constants.js'
import StageHeader from '../../containers/stage-header.jsx'
import Stage from '../../containers/stage.jsx'
import Loader from '../loader/loader.jsx'
import { connect } from 'react-redux'
import { setFlagClickedState } from './../../reducers/vm-status.js'

import styles from './stage-wrapper.css'

const StageWrapperComponent = function (props) {
  const { isFullScreen, isRtl, isRendererSupported, loading, stageSize, vm, flagClicked } = props

  return (
    <Box
      className={classNames(styles.stageWrapper, { [styles.fullScreen]: isFullScreen })}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Box className={styles.stageMenuWrapper}>
        <StageHeader stageSize={stageSize} vm={vm} />
      </Box>
      <div className={flagClicked ?styles.dummy:styles.dummydis}>
      <div className={styles.relativeContainer}>
            {!isFullScreen && (
              <button className={styles.canvasPos} onClick={() => props.setFlagClickedState(false)}>
                &times;
              </button>
            )}
          </div>
        <Box className={ styles.stageCanvasWrapper}>
          {
            isRendererSupported ? (
              <Stage stageSize={stageSize} vm={vm} />
            ) : (
              <Stage stageSize={stageSize} vm={vm} />
            )
            // (to-do)need to change this to the following the css is conflicting with isRendererSupported check that
          }
        </Box>
      </div>
      
      {loading ? <Loader isFullScreen={isFullScreen} /> : null}
    </Box>
  )
}

StageWrapperComponent.propTypes = {
  isFullScreen: PropTypes.bool,
  isRendererSupported: PropTypes.bool.isRequired,
  isRtl: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
  vm: PropTypes.instanceOf(VM).isRequired,
}

const mapStateToProps = (state) => ({
  flagClicked: state.scratchGui.vmStatus.flagClicked,
})
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = {
  setFlagClickedState,
}
export default connect(mapStateToProps, mapDispatchToProps)(StageWrapperComponent)
