import React from 'react'
import CreateIcon from '@material-ui/icons/Create';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import NoteIcon from '@material-ui/icons/Note';
import ClearIcon from '@material-ui/icons/Clear';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {Stage, Layer, Line} from 'react-konva';
import {v4 as uuid} from "uuid";

import { w3cwebsocket as W3CWebSocket } from "websocket";

import EditableText from "./EditableText";
import Note from "./Note";
import mappers from "./mappers";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: 'draw',
            isDrawing: false,
            points: [],
            elements: []
        };

        this.client = null;

        this.notifyUpdate = this.notifyUpdate.bind(this)
        this.changeMode = this.changeMode.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleTextChanged = this.handleTextChanged.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.renderElement = this.renderElement.bind(this)
    }

    componentDidMount() {
        this.client = new W3CWebSocket(process.env.REACT_APP_WEBSOCKETS ?? 'ws://127.0.0.1:8000');

        this.client.onopen = () => {
            console.log()
        };
        this.client.onmessage = (message) => {
            this.setState({
                elements: mappers.serverToClient(JSON.parse(message.data))
            })
        }
    }

    notifyUpdate() {
        this.client.send(JSON.stringify(mappers.clientToServer(this.state.elements)));
    }

    changeMode(event, newMode) {
        document.activeElement.blur()
        this.setState({mode: newMode});
    }

    updateLine(elements, points) {
        return elements[elements.length - 1].type === 'line' ? [...elements.slice(0, elements.length - 1), {
            ...elements[elements.length - 1],
            points
        }] : elements
    }

    handleMouseUp(event) {
        switch (this.state.mode) {
            case 'draw':
                if (this.state.isDrawing) {
                    this.setState({
                        isDrawing: false,
                        elements: this.updateLine(this.state.elements, this.state.points),
                        points: []
                    });
                }
                this.notifyUpdate()
                break;
            default:

        }
    }

    handleMouseMove(event) {
        switch (this.state.mode) {
            case 'draw':
                if (this.state.isDrawing) {
                    const coordinates = event.target.pointerPos;
                    if (coordinates) {
                        this.setState({
                            elements: this.updateLine(this.state.elements, this.state.points),
                            points: [...this.state.points, coordinates.x, coordinates.y]
                        });
                    }
                }
                break;
            default:

        }
    }

    handleMouseDown(event) {
        const coordinates = event.target.pointerPos;
        switch (this.state.mode) {
            case 'draw':
                this.setState({
                    isDrawing: true,
                    elements: [...this.state.elements, {
                        type: 'line',
                        points: [],
                        x: 0,
                        y: 0,
                        uuid: uuid()
                    }]
                })
                break;
            case 'text':
                if (coordinates) {
                    this.setState({
                        elements: [...this.state.elements, {
                            type: 'text',
                            text: 'Edit me!',
                            x: coordinates.x,
                            y: coordinates.y,
                            editing: false,
                            uuid: uuid()
                        }]
                    });
                    this.notifyUpdate();
                }
                break;
            case 'note':
                if (coordinates) {
                    this.setState({
                        elements: [...this.state.elements, {
                            type: 'note',
                            text: 'Edit me!',
                            x: coordinates.x,
                            y: coordinates.y,
                            editing: false,
                            uuid: uuid()
                        }]
                    });
                    this.notifyUpdate();
                }
                break;
            default:
        }
    }

    handleClick(event, number) {
        switch (this.state.mode) {
            case 'select':
                this.setState({
                    elements: [
                        ...this.state.elements.slice(0, number),
                        ...this.state.elements.slice(number + 1, this.state.elements.length),
                        this.state.elements[number]
                    ]
                });
                break;
            case 'clear':
                this.setState({
                    elements: [
                        ...this.state.elements.slice(0, number),
                        ...this.state.elements.slice(number + 1, this.state.elements.length)
                    ]
                });
                this.notifyUpdate();
                break;
            default:
        }
    }

    handleDoubleClick(event, index) {
        if (this.state.mode === 'select') {
            this.setState({
                elements: [
                    ...this.state.elements.slice(0, index),
                    {
                        ...this.state.elements[index],
                        editing: true
                    },
                    ...this.state.elements.slice(index + 1, this.state.elements.length)
                ]
            });
        }
    }

    handleTextChanged(event, index) {
        this.setState({
            elements: [
                ...this.state.elements.slice(0, index),
                {
                    ...this.state.elements[index],
                    text: event.target.value
                },
                ...this.state.elements.slice(index + 1, this.state.elements.length)
            ]
        })
    }

    handleDrag(event, index) {
        this.setState({
            elements: [
                ...this.state.elements.slice(0, index),
                {
                    ...this.state.elements[index],
                    x: event.target.x(),
                    y: event.target.y()
                },
                ...this.state.elements.slice(index + 1, this.state.elements.length)
            ],
            draggingIndex: -1
        })
        this.notifyUpdate();
    }

    handleBlur(event, index) {
        if (this.state.elements[index].type !== 'line') {
            this.setState({
                elements: [
                    ...this.state.elements.slice(0, index),
                    {
                        ...this.state.elements[index],
                        editing: false
                    },
                    ...this.state.elements.slice(index + 1, this.state.elements.length)
                ],
                draggingIndex: -1
            })
            this.notifyUpdate();
        }
    }

    renderLine(line, index) {
        return (
            <Line
                ref={line.ref}
                key={index}
                points={line.points}
                stroke='#ff3000'
                strokeWidth={5}
                draggable={this.state.mode === 'select'}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation="source-over"
                onClick={event => this.handleClick(event, index)}
                onDragEnd={event => this.handleDrag(event, index)}
                x={line.x}
                y={line.y}
            />
        )
    }

    renderText(text, index) {
        return (
            <EditableText
                key={index}
                text={text.text}
                x={text.x}
                y={text.y}
                onClick={event => this.handleClick(event, index)}
                onTextChanged={event => this.handleTextChanged(event, index)}
                draggable={this.state.mode === 'select'}
                editing={text.editing}
                onDblClick={event => this.handleDoubleClick(event, index)}
                onBlur={event => this.handleBlur(event, index)}
                onDragEnd={event => this.handleDrag(event, index)}
            />
        )
    }

    renderNote(note, index) {
        return (<Note
            key={index}
            x={note.x}
            y={note.y}
            text={note.text}
            onClick={event => this.handleClick(event, index)}
            onTextChanged={event => this.handleTextChanged(event, index)}
            draggable={this.state.mode === 'select'}
            editing={note.editing}
            onDblClick={event => this.handleDoubleClick(event, index)}
            onBlur={event => this.handleBlur(event, index)}
            onDragEnd={event => this.handleDrag(event, index)}
        />)
    }

    renderElement(element, index) {
        switch (element.type) {
            case 'line':
                return this.renderLine.bind(this)(element, index)
            case 'text':
                return this.renderText.bind(this)(element, index)
            case 'note':
                return this.renderNote.bind(this)(element, index)
            default:
                console.error(`Cant render element of type: ${element.type}`)
        }
    }

    render() {
        const elements = this.state.elements.map((element, index) => this.renderElement(element, index))

        return (
            <div>
                <ToggleButtonGroup
                    value={this.state.mode}
                    exclusive
                    onChange={this.changeMode}
                >
                    <ToggleButton value={'select'}><SelectAllIcon/></ToggleButton>
                    <ToggleButton value={'draw'}><CreateIcon/></ToggleButton>
                    <ToggleButton value={'text'}><TextFieldsIcon/></ToggleButton>
                    <ToggleButton value={'note'}><NoteIcon/></ToggleButton>
                    <ToggleButton value={'clear'}><ClearIcon/></ToggleButton>
                </ToggleButtonGroup>

                <Stage
                    width={window.innerWidth}
                    height={window.innerHeight - 48}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onMouseMove={this.handleMouseMove}
                >
                    <Layer>
                        {elements}
                    </Layer>
                </Stage>
            </div>
        )
    }
}


export default App;
