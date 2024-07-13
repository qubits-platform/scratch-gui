import PropTypes from 'prop-types'
import classNames from 'classnames'
import React from 'react'
import Box from '../box/box.jsx'
import styles from './blocks.css'
import stylesteacher from './blocksteacher.css'

const BlocksComponent = (props) => {
  const { containerRef, dragOver, currentLayout, ...componentProps } = props
  return (
    <>
      {currentLayout === 'teacher' ? (
      <Box className={classNames(stylesteacher.blocksteacher, { [styles.dragOver]: dragOver })}
           {...componentProps} 
           componentRef={containerRef} />
    ) : (
      <Box className={classNames(styles.blocks, { [styles.dragOver]: dragOver })}
           {...componentProps} 
           componentRef={containerRef} />
    )}
    </>
    
  )
}
BlocksComponent.propTypes = {
  containerRef: PropTypes.func,
  dragOver: PropTypes.bool,
}
export default BlocksComponent
