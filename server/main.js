const mongo = require('./mongo')
const server = require('./server')

async function main() {
    await mongo.connectDB();
    server.startServer();
}

main()
    .then(() => console.log("Server started."))
    .catch(e => console.error(e));
