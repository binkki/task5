import React from 'react'
import PropTypes from 'prop-types'
import Portal from "./Portal";
import {Text} from 'react-konva';

class EditableText extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
        onClick: PropTypes.func,
        onTextChanged: PropTypes.func,
        draggable: PropTypes.bool,
        editing: PropTypes.bool,
        onDblClick: PropTypes.func,
        onBlur: PropTypes.func,
        onDragEnd: PropTypes.func
    }

    static defaultProps = {
        x: 0,
        y: 0,
        text: "Edit me!",
        draggable: false,
        onTextChanged: () => null,
        onClick: () => null,
        onDblClick: () => null,
        onBlur: () => null,
        onDragEnd: () => null
    }

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this)
    }

    handleEdit(event) {
        this.props.onTextChanged(event);
    }

    componentDidMount() {
        // document.getElementById("asdasd").focus()
    }

    render() {
        if (this.props.editing) {
            return (<Portal>
                <input
                    defaultValue={this.props.text}
                    style={{
                        position: "absolute",
                        left: this.props.x,
                        top: this.props.y + 48,
                        background: "none",
                        outline: "none",
                        resize: "none",
                        border: "none",
                        color: "red"
                    }}
                    onChange={this.handleEdit}
                    onBlur={this.props.onBlur}
                />
            </Portal>)
        } else {
            return (<Text
                text={this.props.text}
                x={this.props.x}
                y={this.props.y}
                onClick={this.props.onClick}
                draggable={this.props.draggable}
                onDblClick={this.props.onDblClick}
                onDragEnd={this.props.onDragEnd}
            />)
        }
    }
}

export default EditableText;
