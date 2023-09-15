import classNames from "classnames";
import bindAll from "lodash.bindall";
import PropTypes from "prop-types";
import React from "react";
import { defineMessages, injectIntl, intlShape } from "react-intl";

import LibraryItem from "../../containers/library-item.jsx";
import Modal from "../../containers/modal.jsx";
import Divider from "../divider/divider.jsx";
import Filter from "../filter/filter.jsx";
import TagButton from "../../containers/tag-button.jsx";
import Spinner from "../spinner/spinner.jsx";
import CardsProjects from "./cards-projects.jsx";

import styles from "./library.css";
import styles1 from "./ClickableCard.css";
import apiService from "../../../apiService.js";
import "regenerator-runtime/runtime";

const messages = defineMessages({
    filterPlaceholder: {
        id: "gui.library.filterPlaceholder",
        defaultMessage: "Search",
        description: "Placeholder text for library search field",
    },
    allTag: {
        id: "gui.library.allTag",
        defaultMessage: "All",
        description:
            "Label for library tag to revert to all items after filtering by tag.",
    },
});

const ALL_TAG = { tag: "all", intlLabel: messages.allTag };
const tagListPrefix = [ALL_TAG];

class LibraryComponent extends React.Component {
    constructor(props) {
        super(props);
        bindAll(this, [
            "handleClose",
            "handleFilterChange",
            "handleFilterClear",
            "handleMouseEnter",
            "handleMouseLeave",
            "handlePlayingEnd",
            "handleSelect",
            "handleTagClick",
            "setFilteredDataRef",
            "getProjectsData",
            "deleteIds",
            "closeModal",
        ]);
        this.state = {
            playingItem: null,
            filterQuery: "",
            selectedTag: ALL_TAG.tag,
            loaded: false,
            products: [],
            gotProducts: [],
            selectedProduct: "",
            isModalOpen: false,
            selectedId: null,
            selectedName: "",
            isLoadedSpinner: false,
        };

        // this.handleProductChange = this.handleProductChange.bind(this);
    }
    componentDidMount() {
        // Allow the spinner to display before loading the content
        this.getProjectsData();

        setTimeout(() => {
            this.setState({ loaded: true });
        });
        if (this.props.setStopHandler)
            this.props.setStopHandler(this.handlePlayingEnd);
    }

    async getProjectsData() {
        this.setState({ isLoadedSpinner: true });
        const data = await apiService.get();
        if (data?.status == "success") {
            this.setState({ isLoadedSpinner: false });
            this.setState({ products: data?.data });
        } else {
            this.setState({ isLoadedSpinner: false });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.filterQuery !== this.state.filterQuery ||
            prevState.selectedTag !== this.state.selectedTag
        ) {
            this.scrollToTop();
        }
        this.state.products;
    }

    deleteIds(id, name) {
        this.setState({ isModalOpen: true });
        this.setState({ selectedId: id });
        this.setState({ selectedName: name });
    }

    handleDelete = async (id) => {
        this.setState({ isLoadedSpinner: true });
        const deletedItem = await apiService.delete(id); // Make a DELETE request
        if (deletedItem?.status == "204") {
            this.setState({ isLoadedSpinner: false });
            this.getProjectsData();
            this.closeModal();
        }
    };

    closeModal() {
        this.setState({ isModalOpen: false });
    }

    handleSelect(id) {
        this.handleClose();
        this.props.onItemSelected(this.getFilteredData()[id]);
    }
    handleClose() {
        this.props.onRequestClose();
    }
    handleTagClick(tag) {
        if (this.state.playingItem === null) {
            this.setState({
                filterQuery: "",
                selectedTag: tag.toLowerCase(),
            });
        } else {
            this.props.onItemMouseLeave(
                this.getFilteredData()[[this.state.playingItem]]
            );
            this.setState({
                filterQuery: "",
                playingItem: null,
                selectedTag: tag.toLowerCase(),
            });
        }
    }
    handleMouseEnter(id) {
        // don't restart if mouse over already playing item
        if (this.props.onItemMouseEnter && this.state.playingItem !== id) {
            this.props.onItemMouseEnter(this.getFilteredData()[id]);
            this.setState({
                playingItem: id,
            });
        }
    }
    handleMouseLeave(id) {
        if (this.props.onItemMouseLeave) {
            this.props.onItemMouseLeave(this.getFilteredData()[id]);
            this.setState({
                playingItem: null,
            });
        }
    }
    handlePlayingEnd() {
        if (this.state.playingItem !== null) {
            this.setState({
                playingItem: null,
            });
        }
    }
    handleFilterChange(event) {
        if (this.state.playingItem === null) {
            this.setState({
                filterQuery: event.target.value,
                selectedTag: ALL_TAG.tag,
            });
        } else {
            this.props.onItemMouseLeave(
                this.getFilteredData()[[this.state.playingItem]]
            );
            this.setState({
                filterQuery: event.target.value,
                playingItem: null,
                selectedTag: ALL_TAG.tag,
            });
        }
    }
    handleFilterClear() {
        this.setState({ filterQuery: "" });
    }
    getFilteredData() {
        if (this.state.selectedTag === "all") {
            if (!this.state.filterQuery) return this.props.data;
            return this.props.data.filter(
                (dataItem) =>
                    (dataItem.tags || [])
                        // Second argument to map sets `this`
                        .map(
                            String.prototype.toLowerCase.call,
                            String.prototype.toLowerCase
                        )
                        .concat(
                            dataItem.name
                                ? (typeof dataItem.name === "string"
                                      ? // Use the name if it is a string, else use formatMessage to get the translated name
                                        dataItem.name
                                      : this.props.intl.formatMessage(
                                            dataItem.name.props
                                        )
                                  ).toLowerCase()
                                : null
                        )
                        .join("\n") // unlikely to partially match newlines
                        .indexOf(this.state.filterQuery.toLowerCase()) !== -1
            );
        }
        return this.props.data.filter(
            (dataItem) =>
                dataItem.tags &&
                dataItem.tags
                    .map(
                        String.prototype.toLowerCase.call,
                        String.prototype.toLowerCase
                    )
                    .indexOf(this.state.selectedTag) !== -1
        );
    }
    scrollToTop() {
        this.filteredDataRef.scrollTop = 0;
    }
    setFilteredDataRef(ref) {
        this.filteredDataRef = ref;
    }
    render() {
        return (
            <Modal
                fullScreen
                contentLabel={this.props.title}
                id={this.props.id}
                onRequestClose={this.handleClose}
            >
                {(this.props.filterable || this.props.tags) &&
                    !(this.props.id == "tipsLibrary") && (
                        <div className={styles.filterBar}>
                            {this.props.filterable && (
                                <Filter
                                    className={classNames(
                                        styles.filterBarItem,
                                        styles.filter
                                    )}
                                    filterQuery={this.state.filterQuery}
                                    inputClassName={styles.filterInput}
                                    placeholderText={this.props.intl.formatMessage(
                                        messages.filterPlaceholder
                                    )}
                                    onChange={this.handleFilterChange}
                                    onClear={this.handleFilterClear}
                                />
                            )}
                            {this.props.filterable && this.props.tags && (
                                <Divider
                                    className={classNames(
                                        styles.filterBarItem,
                                        styles.divider
                                    )}
                                />
                            )}
                            {this.props.tags && (
                                <div className={styles.tagWrapper}>
                                    {tagListPrefix
                                        .concat(this.props.tags)
                                        .map((tagProps, id) => (
                                            <TagButton
                                                active={
                                                    this.state.selectedTag ===
                                                    tagProps.tag.toLowerCase()
                                                }
                                                className={classNames(
                                                    styles.filterBarItem,
                                                    styles.tagButton,
                                                    tagProps.className
                                                )}
                                                key={`tag-button-${id}`}
                                                onClick={this.handleTagClick}
                                                {...tagProps}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                <div
                    className={classNames(
                        styles.libraryScrollGrid,
                        styles?.cardContainer,
                        {
                            [styles.withFilterBar]:
                                this.props.filterable || this.props.tags,
                        }
                    )}
                    ref={this.setFilteredDataRef}
                >
                    {this?.state?.isLoadedSpinner && (
                        <div className={styles.spinnerWrapper}>
                            <Spinner large level="primary" />
                        </div>
                    )}

                    {this?.state?.isModalOpen && (
                        <>
                            <div className={styles1?.modal}>
                                <h5>
                                    Are you sure you want to delete{" "}
                                    {this.state.selectedName}?
                                </h5>
                                <div className={styles1.buttonFlex}>
                                    <button
                                        className={styles1.buttonCancel}
                                        onClick={this.closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles1.buttonConfirm}
                                        onClick={() =>
                                            this.handleDelete(
                                                this.state.selectedId
                                            )
                                        }
                                    >
                                        Confirm Delete
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {this?.props?.id == "tipsLibrary" &&
                        this?.state?.isLoadedSpinner === false &&
                        this?.state?.products?.length < 1 && (
                            <p className={styles.error}>Projects are empty</p>
                        )}
                    {this.props.id == "tipsLibrary" ? (
                        this?.state?.products?.map((dataItem, index) => (
                            <CardsProjects
                                projectData={dataItem}
                                deleteId={this.deleteIds}
                                onClose={this.closeModal}
                                onRequestCardClose={this.handleClose}
                                refreshApiData={this.getProjectsData}
                                key={index}
                            />
                        ))
                    ) : this.state.loaded ? (
                        this.getFilteredData().map((dataItem, index) => (
                            <LibraryItem
                                bluetoothRequired={dataItem.bluetoothRequired}
                                collaborator={dataItem.collaborator}
                                description={dataItem.description}
                                disabled={dataItem.disabled}
                                extensionId={dataItem.extensionId}
                                featured={dataItem.featured}
                                hidden={dataItem.hidden}
                                iconMd5={
                                    dataItem.costumes
                                        ? dataItem.costumes[0].md5ext
                                        : dataItem.md5ext
                                }
                                iconRawURL={dataItem.rawURL}
                                icons={dataItem.costumes}
                                id={index}
                                insetIconURL={dataItem.insetIconURL}
                                internetConnectionRequired={
                                    dataItem.internetConnectionRequired
                                }
                                isPlaying={this.state.playingItem === index}
                                key={
                                    typeof dataItem.name === "string"
                                        ? dataItem.name
                                        : dataItem.rawURL
                                }
                                name={dataItem.name}
                                showPlayButton={this.props.showPlayButton}
                                onMouseEnter={this.handleMouseEnter}
                                onMouseLeave={this.handleMouseLeave}
                                onSelect={this.handleSelect}
                            />
                        ))
                    ) : (
                        <div className={styles.spinnerWrapper}>
                            <Spinner large level="primary" />
                        </div>
                    )}
                </div>
            </Modal>
        );
    }
}

LibraryComponent.propTypes = {
    data: PropTypes.arrayOf(
        // An item in the library
        PropTypes.shape({
            // @todo remove md5/rawURL prop from library, refactor to use storage
            md5: PropTypes.string,
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
            rawURL: PropTypes.string,
        })
    ),
    filterable: PropTypes.bool,
    id: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    onItemMouseEnter: PropTypes.func,
    onItemMouseLeave: PropTypes.func,
    isLoadedSpinner: PropTypes.bool,
    onItemSelected: PropTypes.func,
    onRequestClose: PropTypes.func,
    setStopHandler: PropTypes.func,
    showPlayButton: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.shape(TagButton.propTypes)),
    title: PropTypes.string.isRequired,
};

LibraryComponent.defaultProps = {
    filterable: true,
    showPlayButton: false,
};

export default injectIntl(LibraryComponent);
