import React from 'react'
import PropTypes from 'prop-types'
import Portal from "./Portal";
import {Text, Rect} from 'react-konva';

window.canvas = window.canvas ?? document.createElement("canvas");

class Note extends React.Component {
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
        onDragEnd: PropTypes.func,
        font: PropTypes.number
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
        onDragEnd: () => null,
        font: 14
    }

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this)
        this.handleDragMove = this.handleDragMove.bind(this)
    }

    handleEdit(event) {
        this.props.onTextChanged(event);
    }

    static getDerivedStateFromProps(props, state) {
        state = {
            textX: props.x + 10,
            textY: props.y + 30
        }
        return state
    }

    handleDragMove(event) {
        this.setState(
            {
                textX: event.target.x() + 10,
                textY: event.target.y() + 30
            }
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.state)
    }

    render() {
        const context = window.canvas.getContext("2d");
        context.font = `${this.props.font}px sans-serif`;
        const metrics = context.measureText(this.props.text);

        let innerText;
        if (this.props.editing) {
            innerText = (<Portal>
                <input
                    defaultValue={this.props.text}
                    style={{
                        position: "absolute",
                        left: this.state.textX,
                        top: this.state.textY + 48,
                        background: "none",
                        outline: "none",
                        resize: "none",
                        border: "none",
                        color: "red",
                        fontSize: `${this.props.font}px`
                    }}
                    onChange={this.handleEdit}
                    onBlur={this.props.onBlur}
                />
            </Portal>)
        } else {
            innerText = (<Text
                text={this.props.text}
                x={this.state.textX}
                y={this.state.textY}
                onClick={this.props.onClick}
                onDblClick={this.props.onDblClick}
                fontSize={this.props.font}
            />)
        }

        return (<React.Fragment>
            <Rect
                x={this.props.x}
                y={this.props.y}
                width={metrics.width + 20}
                height={60}
                fill="yellow"
                shadowBlur={5}
                draggable={this.props.draggable}
                onClick={this.props.onClick}
                onDragMove={this.handleDragMove}
                onDragEnd={this.props.onDragEnd}
            >
            </Rect>
            {innerText}
        </React.Fragment>)
    }
}

export default Note;
