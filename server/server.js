const WebSocket = require('ws');
const models = require('./models');
const wss = new WebSocket.Server({port: process.env.PORT});

function broadcast(message) {
    wss.clients.forEach(function each(client) {
        client.send(message);
    });
}

async function updateMongo(message) {
    await models.collection.updateOne({name: 'lines'}, {
        name: 'lines',
        data: JSON.stringify(message.lines)
    }, {upsert: true, setDefaultsOnInsert: true});

    await models.collection.updateOne({name: 'texts'}, {
        name: 'texts',
        data: JSON.stringify(message.texts)
    }, {upsert: true, setDefaultsOnInsert: true});

    await models.collection.updateOne({name: 'notes'}, {
        name: 'notes',
        data: JSON.stringify(message.notes)
    }, {upsert: true, setDefaultsOnInsert: true});
}

function handleMessage(message) {
    updateMongo(JSON.parse(message))
        .then(() => broadcast(message));
}

async function formatResponse() {
    const linesData = await models.collection.findOne({name: 'lines'}).exec();
    const lines = (linesData && linesData.data) ? JSON.parse(linesData.data) : [];

    const textsData = await models.collection.findOne({name: 'texts'}).exec();
    const texts = (textsData && textsData.data) ? JSON.parse(textsData.data) : [];

    const notesData = await models.collection.findOne({name: 'notes'}).exec();
    const notes = (notesData && notesData.data) ? JSON.parse(notesData.data) : [];

    return {
        lines,
        texts,
        notes
    }
}

async function handleConnection(ws) {
    ws.on('message', handleMessage);

    formatResponse()
        .then(res => ws.send(JSON.stringify(res)))
}

function startServer() {
    wss.on('connection', handleConnection);
}

module.exports = {
    startServer
};
