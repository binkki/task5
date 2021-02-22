import {v4 as uuid} from "uuid";

function _clientToServerLine(line, number) {
    return {
        points: line.points,
        x: line.x,
        y: line.y,
        uuid: line.uuid,
        number
    }
}

function _clientToServerText(text, number) {
    return {
        text: text.text,
        x: text.x,
        y: text.y,
        uuid: text.uuid,
        number
    }
}

function _clientToServerNote(note, number) {
    return {
        text: note.text,
        x: note.x,
        y: note.y,
        uuid: note.uuid,
        number
    }
}

function _addTypes(response) {
    let result = [];
    for (let line of response.lines) {
        result.push({...line, type: 'line'});
    }

    for (let text of response.texts) {
        result.push({...text, type: 'text'});
    }

    for (let note of response.notes) {
        result.push({...note, type: 'note'});
    }

    return result;
}

function _numberComparer(a, b) {
    if (b.number < a.number) {
        return -1;
    }
    if (b.number > a.number) {
        return 1;
    }

    return 0;
}

function _serverToClientLine(line) {
    return {
        type: 'line',
        points: line.points,
        x: line.x,
        y: line.y,
        uuid: line.uuid,
    }
}

function _serverToClientText(text) {
    return {
        type: 'text',
        text: text.text,
        x: text.x,
        y: text.y,
        uuid: text.uuid,
        editing: false
    }
}

function _serverToClientNote(note) {
    return {
        type: 'note',
        text: note.text,
        x: note.x,
        y: note.y,
        uuid: note.uuid,
        editing: false
    }
}


function clientToServer(elements) {
    let result = {
        lines: [],
        texts: [],
        notes: []
    };
    for (let i=0; i < elements.length; i++) {
        switch (elements[i].type) {
            case 'line':
                result.lines.push(_clientToServerLine(elements[i], i));
                break;
            case 'text':
                result.texts.push(_clientToServerText(elements[i], i));
                break;
            case 'note':
                result.notes.push(_clientToServerNote(elements[i], i));
                break;
            default:
                console.error(`Cannot map ${elements[i]}. Unrecognized type.`)
        }
    }

    return result;
}

function serverToClient(elements) {
    let result = _addTypes(elements);
    result = result.sort(_numberComparer);

    for (let i=0; i < result.length; i++) {
        switch (result[i].type) {
            case 'line':
                result[i] = _serverToClientLine(result[i]);
                break;
            case 'text':
                result[i] = _serverToClientText(result[i]);
                break;
            case 'note':
                result[i] = _serverToClientNote(result[i]);
                break;
            default:
                console.error(`Cannot map ${result[i]}. Unrecognized type.`)
        }
    }

    return result;
}

const mappers = {
    clientToServer,
    serverToClient
};

export default mappers;
