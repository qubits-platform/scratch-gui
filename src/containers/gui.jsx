import PropTypes from "prop-types";
import React, { useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import ReactModal from "react-modal";
import VM from "scratch-vm";
import { injectIntl, intlShape } from "react-intl";
import parser from "html-react-parser";
import ErrorBoundaryHOC from "../lib/error-boundary-hoc.jsx";
import { getIsError, getIsShowingProject } from "../reducers/project-state";
import {
    activateTab,
    BLOCKS_TAB_INDEX,
    COSTUMES_TAB_INDEX,
    SOUNDS_TAB_INDEX,
} from "../reducers/editor-tab";
import log from "../lib/log.js";
import {
    closeCostumeLibrary,
    closeBackdropLibrary,
    closeTelemetryModal,
    openExtensionLibrary,
} from "../reducers/modals";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import FontLoaderHOC from "../lib/font-loader-hoc.jsx";
import LocalizationHOC from "../lib/localization-hoc.jsx";
import SBFileUploaderHOC from "../lib/sb-file-uploader-hoc.jsx";
import ProjectFetcherHOC from "../lib/project-fetcher-hoc.jsx";
import TitledHOC from "../lib/titled-hoc.jsx";
import ProjectSaverHOC from "../lib/project-saver-hoc.jsx";
import QueryParserHOC from "../lib/query-parser-hoc.jsx";
import storage from "../lib/storage";
import vmListenerHOC from "../lib/vm-listener-hoc.jsx";
import vmManagerHOC from "../lib/vm-manager-hoc.jsx";
import cloudManagerHOC from "../lib/cloud-manager-hoc.jsx";
import systemPreferencesHOC from "../lib/system-preferences-hoc.jsx";

import GUIComponent from "../components/gui/gui.jsx";
import { setIsScratchDesktop } from "../lib/isScratchDesktop.js";
import styles from "../components/gui/gui.css";
import SB3Downloader from "./sb3-downloader.jsx";
import MenuItem from "./menu-item.jsx";
import {
    openAboutMenu,
    closeAboutMenu,
    aboutMenuOpen,
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen,
    openModeMenu,
    closeModeMenu,
    modeMenuOpen,
    settingsMenuOpen,
    openSettingsMenu,
    closeSettingsMenu,
} from "../reducers/menus.js";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import apiServeice from "../../apiService";
import { LoadingStates, requestNewProject } from "../reducers/project-state.js";
import bindAll from "lodash.bindall";
import styles1 from "../components/gui/gui.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import CommentComponent from "./comment.jsx";

class GUI extends React.Component {
    constructor(props) {
        super(props);

        this.getAssignmentServiceDetails =
            this.getAssignmentServiceDetails.bind(this);
        this.saveSubmission = this.saveSubmission.bind(this);
        this.postAssignment = this.postAssignment.bind(this);
        this.RemoveSubmissionClick = this.RemoveSubmissionClick.bind(this);
        this.commentCon = this.commentCon.bind(this);
        this.state = {
            responseData: null,
            Edit: false,
            isId: null,
            isPageLoaded: false,
            grade: undefined,
            gradeon: undefined,
            gradedby: undefined,
            feedbackStatus: undefined,
            feedbackdetails: null,
            setAddComment: "",
            commentContent: "",
            gradingStatus: "pending...",
        };

        bindAll(this, ["handleClickNew", "getSaveToComputerHandler"]);
    }

    componentDidMount() {
        // page loaded
        window.onload = () => {
            this.setState({ isPageLoaded: true });
        };

        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("uid", "python");
        window.history.replaceState({}, "", `?${queryParams.toString()}`);

        setIsScratchDesktop(this.props.isScratchDesktop);
        this.props.onStorageInit(storage);
        this.props.onVmInit(this.props.vm);
        this.getAssignmentServiceDetails();

        // query string
        const params = new URLSearchParams(window.location.search); // id=123
        let id = params.get("uid"); // 123
        this.setState({ isId: id });
    }

    async getAssignmentServiceDetails() {
        const params = new URLSearchParams(window.location.search); // id=123
        let id = params.get("uid"); // 123
        //const url = `${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=mod_qbassign_get_assignment_service`;
        const url =
            "http://qubits.localhost.com/lib/ajax/service-react.php?sesskey=vTM5hHtphr&info=mod_qbassign_get_assignment_service";
        //    const url = `${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=mod_qbassign_get_assignment_service`
        const payload = [
            {
                index: 0,
                methodname: "mod_qbassign_get_assignment_service",
                args: {
                    uniquefield: id,
                },
            },
        ];

        await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({ commentContent: null });
                this.setState({
                    responseData: data,
                });

                const submissionStatus = this.state.responseData?.map(
                    (item) => {
                        return item.data.assignmentdetails.submission_status;
                    }
                );

                if (submissionStatus == "0") {
                    this.handleClickNew();
                }

                const feedback = this.state.responseData?.map((item) => {
                    return item.data.assignmentdetails.feedback;
                });

                this.setState({
                    feedbackdetails: feedback,
                });

                this.state.feedbackdetails?.map((item) => {
                    this.setState({ grade: item.grade });
                    this.setState({ gradeon: item.grade_on });
                    this.setState({ gradedby: item.grade_by });

                    this.setState({ feedbackStatus: item.feedback_status });
                });

                const addComment = this.state.responseData?.map((item) => {
                    return item.data.assignmentdetails.submissiontypes
                        .additional_comments;
                });

                const strAddComment = addComment.toString();

                this.setState({ setAddComment: strAddComment });

                const grading = this.state.responseData?.map((item) => {
                    return item.data.assignmentdetails.feedback.grade;
                });
                this.setState({ gradingStatus: grading });
            })
            .catch((error) => {
                console.log("err", error);
            });
    }

    saveSubmission(data) {
        this.postAssignment(data);
    }

    blobToBase64 = (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((resolve) => {
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    };

    async postAssignment(data) {
        const base64Data = await this.blobToBase64(data);
        const cleanedBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
        //const url = `${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=mod_qbassign_get_assignment_service`;
        var Buffer = require("buffer/").Buffer;
        const buffer = Buffer.from(cleanedBase64, "base64");
        const { responseData } = this.state;
        const assignmentid = responseData?.map((item) => {
            return item.data.assignmentdetails.assignmentid;
        });
        const url =
            "http://qubits.localhost.com/lib/ajax/service-react.php?sesskey=BBSdS6BdX0&info=mod_qbassign_scratch_submission";
        // const url =  `${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=mod_qbassign_scratch_submission`
        const payload = [
            {
                index: 0,
                methodname: "mod_qbassign_scratch_submission",
                args: {
                    qbassignmentid: parseInt(assignmentid),
                    //plugindata_text: base64Data,
                    plugindata_text: cleanedBase64,
                    plugindata_format: 1,
                    plugindata_type: "scratch",
                    explanation: this.state.setAddComment,
                },
            },
        ];

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                this.getAssignmentServiceDetails();

                this.setState({ Edit: false });
            })
            .catch((error) => {
                console.log("err", error);
            });
    }

    EditSubmission = () => {
        this.setState({ Edit: true });
        this.getScratchData();
    };

    createData(name, calories) {
        return { name, calories };
    }

    cancelClick = () => {
        this.setState({ Edit: false });
        this.getAssignmentServiceDetails();
    };

    RemoveSubmissionClick = () => {
        this.RemoveSubmission();
    };

    RemoveSubmission() {
        //const url = `${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=mod_qbassign_remove_submission`;
        const AssignID = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.assignmentid;
        });

        const courseID = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.course_id;
        });

        const sub_id = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.submission_id;
        });

        const url =
            "http://qubits.localhost.com/lib/ajax/service-react.php?sesskey=NKrdQp6eDZ&info=mod_qbassign_remove_submission";
        // const url =  `${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=mod_qbassign_remove_submission`
        const payload = [
            {
                index: 0,
                methodname: "mod_qbassign_remove_submission",
                args: {
                    submissionid: parseInt(sub_id),
                    assignmentid: parseInt(AssignID),
                    courseid: parseInt(courseID),
                    submissiontype: "text",
                },
            },
        ];

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                this.getAssignmentServiceDetails();
                this.handleClickNew();
            })
            .catch((error) => {});
    }

    formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // getScratchData = async () => {
    //     const data = await apiServeice.getProject(466);
    //     this.onload1(data.data);
    // };

    getScratchData = async () => {
        //const data = await apiServeice.getProject(466);
        //this.onload1(data.data);
        const studentsubmitted_content = this.state.responseData?.map(
            (item, i) => {
                return item.data.assignmentdetails.studentsubmitted_content;
            }
        );
        var Buffer = require("buffer/").Buffer;
        const bufferdata = Buffer.from(
            studentsubmitted_content.toString(),
            "base64"
        );
        const result = {
            type: "buffer",
            data: bufferdata,
        };
        // const arrayBuffer = new Uint8Array(bufferdata).buffer;
        const arrayBuffer = new Uint8Array(result.data).buffer;

        await this.onload1(arrayBuffer);
    };

    onload1(arrayBuffer) {
        let loadingSuccess = false;
        this.props.vm
            .loadProject(arrayBuffer)
            .then(() => {
                loadingSuccess = true;
            })
            .catch((error) => {
                log.warn(error);
                //alert(this.props.intl.formatMessage(messages.loadError));
                console.log("errorvalue", error);
            });
        // .then(() => {
        //     // this.props.onLoadingFinished(
        //     //     this.props.loadingState,
        //     //     loadingSuccess
        //     // );
        //     // go back to step 7: whether project loading succeeded
        //     // or failed, reset file objects
        //     // this.removeFileObjects();
        // });
    }

    getSaveToComputerHandler(downloadProjectCallback) {
        return () => {
            this.props.onRequestCloseFile();
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(
                    this.props.vm,
                    this.props.projectTitle,
                    this.props.loclae
                );
                this.props.onProjectTelemetryEvent("projectDidSave", metadata);
            }
        };
    }

    handleClickNew() {
        this.props.onClickNew(false);
    }

    handleInputAddComment = (event) => {
        this.setState({ setAddComment: event.target.value });
    };

    saveComments = () => {
        const AssignID = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.assignmentid;
        });

        const courseID = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.course_id;
        });

        const sub_id = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.submission_id;
        });
        // const { submission_ID, courseID, AssignmentID } = this.props;
        // const url =
        //     "http://qubits.localhost.com/lib/ajax/service-react.php?sesskey=vTM5hHtphr&info=mod_qbassign_save_comment";
        const url = `${M.cfg.wwwroot}/lib/ajax/service.php?sesskey=${M.cfg.sesskey}&info=mod_qbassign_save_comment`;

        const payload = [
            {
                index: 0,
                methodname: "mod_qbassign_save_comment",
                args: {
                    submissionid: parseInt(sub_id),
                    content: this.state.commentContent,
                    courseid: parseInt(courseID),
                    assignmentid: parseInt(AssignID),
                },
            },
        ];

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                this.getAssignmentServiceDetails();
            })
            .catch((error) => {
                console.log("Error occured WhileAdding comments");
            });
    };

    commentCon(event) {
        const newValue = event.target.value;
        this.setState({ commentContent: event.target.value });
    }

    render() {
        const {
            responseData,
            Edit,
            isPageLoaded,
            feedbackStatus,
            grade,
            gradeon,
            gradedby,
            setAddComment,
            gradingStatus,
        } = this.state;
        if (this.props.isError) {
            throw new Error(
                `Error in Scratch GUI [location=${window.location}]: ${this.props.error}`
            );
        }
        const {
            /* eslint-disable no-unused-vars */
            assetHost,
            cloudHost,
            error,
            isError,
            isScratchDesktop,
            isShowingProject,
            onProjectLoaded,
            onStorageInit,
            onUpdateProjectId,
            onVmInit,
            projectHost,
            projectId,
            /* eslint-enable no-unused-vars */
            children,
            fetchingProject,
            isLoading,
            loadingStateVisible,
            ...componentProps
        } = this.props;

        const submissionStatus = responseData?.map((item) => {
            return item.data.assignmentdetails.submission_status;
        });
        const Date = responseData?.map((item) => {
            return item.data.assignmentdetails.last_submitted_date;
        });

        const comment_total = responseData?.map((item) => {
            return item.data.assignmentdetails.comment_total;
        });

        const commentData = responseData?.map((item) => {
            return item.data.assignmentdetails.comments;
        });

        const AssignmentID = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.assignmentid;
        });

        const courseID = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.course_id;
        });

        const submission_ID = this.state.responseData?.map((item) => {
            return item.data.assignmentdetails.submission_id;
        });

        const comments1 = {
            comments: [
                {
                    id: 3,
                    content: "testcomment",
                    fullname: "adminuser",
                    shortname: "Au",
                    userid: 2,
                    time: 21 - 10 - 2023,
                    delete: false,
                },
            ],
            commenttotal: 1,
        };

        const rows = [
            this.createData(
                "Submission Status",
                submissionStatus == "1" ? "submitted" : "Not Submitted"
            ),
            this.createData("Grading Status", gradingStatus),
            this.createData("Last Modified", this.formatDate(Date)),

            this.createData(
                "Comments",
                <CommentComponent
                    commentData={commentData}
                    commentTotal={comment_total}
                    getAPI={this.getAssignmentServiceDetails}
                    submission_ID={submission_ID}
                    courseID={courseID}
                    AssignmentID={AssignmentID}
                    comment={comments1}
                    saveComment={this.saveComments}
                    commentContent={this.commentCon}
                />
            ),
        ];

        const feedback = [
            this.createData("Grade", grade),
            this.createData("Graded on", gradeon),
            this.createData("Graded by", gradedby),
        ];

        // functional component

        return (
            <>
                <div>
                    {/* {isPageLoaded == true && (
                <button>akil</button>
            )} */}
                    {(submissionStatus == "0" || Edit == true) && (
                        <div>
                            <div className={styles1.assignmentWrapper}>
                                <div>
                                    {responseData?.map((item) => {
                                        return (
                                            <div key={item.id}>
                                                <h2>
                                                    {
                                                        item.data
                                                            .assignmentdetails
                                                            .assignment_title
                                                    }
                                                </h2>

                                                <p>
                                                    {parser(
                                                        item.data
                                                            .assignmentdetails
                                                            .assignment_activitydesc
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <GUIComponent
                                loading={
                                    fetchingProject ||
                                    isLoading ||
                                    loadingStateVisible
                                }
                                isCreating={
                                    this.state.responseData ? false : true
                                }
                                {...componentProps}
                            >
                                {children}
                            </GUIComponent>

                            <div className={styles1.assignmentWrapper}>
                                <Accordion
                                    style={{
                                        borderBottom: "1px solid #dee2e6",
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={
                                            <ExpandMoreIcon className="expand-icon" />
                                        }
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <h4>Add Your Comments</h4>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div>
                                            <textarea
                                                style={{
                                                    width: "90%",
                                                    borderColor: "#8f959e",
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                }}
                                                onChange={(e) =>
                                                    this.setState({
                                                        setAddComment:
                                                            e.target.value,
                                                    })
                                                }
                                                value={this.state.setAddComment}
                                            ></textarea>
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            </div>
                            <div style={{ marginBottom: "20px" }}>
                                <SB3Downloader getContent={this.saveSubmission}>
                                    {(className, downloadProjectCallback) => (
                                        <MenuItem
                                            className={styles1.saveChanges}
                                        >
                                            <Stack
                                                className={styles1.saveButton}
                                                direction="row"
                                                spacing={2}
                                            >
                                                <Button
                                                    variant="contained"
                                                    style={{
                                                        backgroundColor:
                                                            "#116cbf",
                                                        textTransform: "none",
                                                        fontSize: "14px",
                                                        borderRadius: "0.5rem",
                                                    }}
                                                    onClick={this.getSaveToComputerHandler(
                                                        downloadProjectCallback
                                                    )}
                                                >
                                                    Save changes
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    style={{
                                                        backgroundColor:
                                                            "#116cbf",
                                                        textTransform: "none",
                                                        fontSize: "14px",
                                                        borderRadius: "0.5rem",
                                                    }}
                                                    disabled={false}
                                                    onClick={this.cancelClick}
                                                >
                                                    Cancel
                                                </Button>
                                            </Stack>
                                        </MenuItem>
                                    )}
                                </SB3Downloader>
                            </div>
                        </div>
                    )}

                    {/* Editcomponent */}
                    {submissionStatus == "1" &&
                        Edit == false &&
                        isPageLoaded == true && (
                            <div>
                                <div className={styles1.assignmentWrapper}>
                                    {responseData?.map((item, i) => {
                                        return (
                                            <div key={i}>
                                                <h3>
                                                    {
                                                        item.data
                                                            .assignmentdetails
                                                            .assignment_title
                                                    }
                                                </h3>
                                                <p className="edittry">
                                                    {" "}
                                                    {parser(
                                                        item.data
                                                            .assignmentdetails
                                                            .assignment_activitydesc
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })}

                                    <div>
                                        <Stack direction="row" spacing={2}>
                                            <Button
                                                id="editButton"
                                                variant="contained"
                                                style={{
                                                    backgroundColor: "#116cbf",
                                                    textTransform: "none",
                                                    fontSize: "14px",
                                                    borderRadius: "0.5rem",
                                                }}
                                                disabled={this.state.feedbackStatus === 1}
                                                onClick={this.EditSubmission}
                                            >
                                                Edit Submission
                                            </Button>
                                            <Button
                                                variant="contained"
                                                style={{
                                                    backgroundColor: "#116cbf",
                                                    textTransform: "none",
                                                    fontSize: "14px",
                                                    borderRadius: "0.5rem",
                                                }}
                                                disabled={
                                                    this.state
                                                        .feedbackStatus === 1
                                                }
                                                onClick={
                                                    this.RemoveSubmissionClick
                                                }
                                            >
                                                Remove Submission
                                            </Button>
                                        </Stack>
                                    </div>

                                    <TableContainer
                                        component={Paper}
                                        className={styles.tableStart}
                                    >
                                        <Table
                                            sx={{ minWidth: 650 }}
                                            aria-label="simple table"
                                        >
                                            <TableBody>
                                                {rows.map((row) => (
                                                    <>
                                                        {row.name ==
                                                        "Comments" ? (
                                                            <>
                                                                {/* {comment_total > 0 ? ( */}
                                                                {comment_total >
                                                                0 ? (
                                                                    <TableRow>
                                                                        <TableCell
                                                                            component="th"
                                                                            scope="row"
                                                                            className="table-align"
                                                                        >
                                                                            {
                                                                                row.name
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="tablecolor table-align">
                                                                            {
                                                                                row.calories
                                                                            }
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </>
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell
                                                                    component="th"
                                                                    scope="row"
                                                                    className="table-align"
                                                                >
                                                                    {row.name}
                                                                </TableCell>
                                                                <TableCell className="tablecolor table-align">
                                                                    {
                                                                        row.calories
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>

                                <br />

                                {feedbackStatus == 1 && (
                                    <div className={styles.feedBack}>
                                        {" "}
                                        <h2>Feedback</h2>
                                        <TableContainer
                                            component={Paper}
                                            className={styles.tableStart}
                                        >
                                            <Table
                                                sx={{ minWidth: 650 }}
                                                aria-label="simple table"
                                            >
                                                <TableBody>
                                                    {feedback.map((row) => (
                                                        <TableRow
                                                            key={row.name}
                                                        >
                                                            <TableCell
                                                                component="th"
                                                                scope="row"
                                                                className="table-align"
                                                            >
                                                                {row.name}
                                                            </TableCell>
                                                            <TableCell className="tablecolor table-align">
                                                                {row.calories}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                )}
                            </div>
                        )}
                </div>

                {this.state.isId == null && (
                    <div>
                        <GUIComponent
                            loading={
                                fetchingProject ||
                                isLoading ||
                                loadingStateVisible
                            }
                            {...componentProps}
                        >
                            {children}
                        </GUIComponent>
                    </div>
                )}
            </>
        );
    }
}

GUI.propTypes = {
    assetHost: PropTypes.string,
    children: PropTypes.node,
    cloudHost: PropTypes.string,
    error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    fetchingProject: PropTypes.bool,
    intl: intlShape,
    isError: PropTypes.bool,
    isLoading: PropTypes.bool,
    isScratchDesktop: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isTotallyNormal: PropTypes.bool,
    loadingStateVisible: PropTypes.bool,
    onProjectLoaded: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onStorageInit: PropTypes.func,
    onUpdateProjectId: PropTypes.func,
    onVmInit: PropTypes.func,
    projectHost: PropTypes.string,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    telemetryModalVisible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired,
    onRequestCloseFile: PropTypes.func,
    onLoadingFinished: PropTypes.func,
    loadingState: PropTypes.oneOf(LoadingStates),
    onClickNew: PropTypes.func,
};

GUI.defaultProps = {
    isScratchDesktop: false,
    isTotallyNormal: false,
    onStorageInit: (storageInstance) =>
        storageInstance.addOfficialScratchWebStores(),
    onProjectLoaded: () => {},
    onUpdateProjectId: () => {},
    onVmInit: (/* vm */) => {},
};

const mapStateToProps = (state) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
        loadingState: loadingState,
        activeTabIndex: state.scratchGui.editorTab.activeTabIndex,
        alertsVisible: state.scratchGui.alerts.visible,
        backdropLibraryVisible: state.scratchGui.modals.backdropLibrary,
        blocksTabVisible:
            state.scratchGui.editorTab.activeTabIndex === BLOCKS_TAB_INDEX,
        cardsVisible: state.scratchGui.cards.visible,
        connectionModalVisible: state.scratchGui.modals.connectionModal,
        costumeLibraryVisible: state.scratchGui.modals.costumeLibrary,
        costumesTabVisible:
            state.scratchGui.editorTab.activeTabIndex === COSTUMES_TAB_INDEX,
        error: state.scratchGui.projectState.error,
        isError: getIsError(loadingState),
        isFullScreen: state.scratchGui.mode.isFullScreen,
        isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
        isRtl: state.locales.isRtl,
        isShowingProject: getIsShowingProject(loadingState),
        loadingStateVisible: state.scratchGui.modals.loadingProject,
        projectId: state.scratchGui.projectState.projectId,
        soundsTabVisible:
            state.scratchGui.editorTab.activeTabIndex === SOUNDS_TAB_INDEX,
        targetIsStage:
            state.scratchGui.targets.stage &&
            state.scratchGui.targets.stage.id ===
                state.scratchGui.targets.editingTarget,
        telemetryModalVisible: state.scratchGui.modals.telemetryModal,
        tipsLibraryVisible: state.scratchGui.modals.tipsLibrary,
        vm: state.scratchGui.vm,
    };
};

const mapDispatchToProps = (dispatch) => ({
    onExtensionButtonClick: () => dispatch(openExtensionLibrary()),
    onActivateTab: (tab) => dispatch(activateTab(tab)),
    onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
    onActivateSoundsTab: () => dispatch(activateTab(SOUNDS_TAB_INDEX)),
    onRequestCloseBackdropLibrary: () => dispatch(closeBackdropLibrary()),
    onRequestCloseCostumeLibrary: () => dispatch(closeCostumeLibrary()),
    onRequestCloseTelemetryModal: () => dispatch(closeTelemetryModal()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onClickNew: (needSave) => dispatch(requestNewProject(needSave)),
    onLoadingFinished: (loadingState, success) => {
        // dispatch(onLoadedProject(loadingState, ownProps.canSave, success));
        dispatch(closeLoadingProject());
        dispatch(closeFileMenu());
    },
});

const ConnectedGUI = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(GUI)
);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = compose(
    LocalizationHOC,
    ErrorBoundaryHOC("Top Level App"),
    FontLoaderHOC,
    QueryParserHOC,
    ProjectFetcherHOC,
    TitledHOC,
    ProjectSaverHOC,
    vmListenerHOC,
    vmManagerHOC,
    SBFileUploaderHOC,
    cloudManagerHOC,
    systemPreferencesHOC
)(ConnectedGUI);

WrappedGui.setAppElement = ReactModal.setAppElement;
export default WrappedGui;
