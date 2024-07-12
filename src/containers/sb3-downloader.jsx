import bindAll from 'lodash.bindall'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { projectTitleInitialState } from '../reducers/project-title'
import downloadBlob from '../lib/download-blob'
import localforage from 'localforage';
/**
 * Project saver component passes a downloadProject function to its child.
 * It expects this child to be a function with the signature
 *     function (downloadProject, props) {}
 * The component can then be used to attach project saving functionality
 * to any other component:
 *
 * <SB3Downloader>{(downloadProject, props) => (
 *     <MyCoolComponent
 *         onClick={downloadProject}
 *         {...props}
 *     />
 * )}</SB3Downloader>
 */
class SB3Downloader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'downloadProject',
            'downloadLocalStorageProject'
        ]);
    }
    downloadProject () {
        this.props.saveProjectSb3().then(content => {
            if (this.props.onSaveFinished) {
                this.props.onSaveFinished();
            }
            downloadBlob(this.props.projectFilename, content);
        });
    }
    downloadLocalStorageProject = async () => {
        const projectName = await localforage.getItem('Current_Project_Name');
        this.props.saveProjectSb3().then(content => {
            if (this.props.onSaveFinished) {
                this.props.onSaveFinished();
            }
            // Convert the Blob to an ArrayBuffer
            const reader = new FileReader();
            reader.onloadend = async() => {
                // Save the ArrayBuffer to local storage as a string
                const buffer = reader.result;
                const binaryString = Array.prototype.map.call(new Uint8Array(buffer), x => String.fromCharCode(x)).join('');
                let base64blocks = btoa(
                    new Uint8Array(buffer)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                await localforage.setItem(projectName, binaryString);
                await localforage.setItem('assignmentProgress', base64blocks);
            };
            reader.readAsArrayBuffer(content);
        });
    }
    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            this.downloadProject,
            this.downloadLocalStorageProject
        );
    }
}

const getProjectFilename = (curTitle, defaultTitle) => {
  let filenameTitle = curTitle
  if (!filenameTitle || filenameTitle.length === 0) {
    filenameTitle = defaultTitle
  }
  return `${filenameTitle.substring(0, 100)}.sb3`
}

SB3Downloader.propTypes = {
  children: PropTypes.func,
  className: PropTypes.string,
  onSaveFinished: PropTypes.func,
  projectFilename: PropTypes.string,
  saveProjectSb3: PropTypes.func,
}
SB3Downloader.defaultProps = {
  className: '',
}

const mapStateToProps = (state) => ({
  saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
  projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState),
})

export default connect(
  mapStateToProps,
  () => ({}), // omit dispatch prop
)(SB3Downloader)
