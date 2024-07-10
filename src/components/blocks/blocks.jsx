import PropTypes from 'prop-types'
import classNames from 'classnames'
import React from 'react'
import Box from '../box/box.jsx'
import styles from './blocks.css'


const BlocksComponent = (props) => {
  const { containerRef, dragOver, currentLayout, ...componentProps } = props
  return (
    <Box
      className={classNames({
        [styles.blocks]: currentLayout !== 'teacher',
        [styles.blocksTeacher]: currentLayout === 'teacher',
        [styles.dragOver]: dragOver,
      })}
      {...componentProps}
  componentRef={containerRef}
/>
  )
}
BlocksComponent.propTypes = {
  containerRef: PropTypes.func,
  dragOver: PropTypes.bool,
}
export default BlocksComponent
