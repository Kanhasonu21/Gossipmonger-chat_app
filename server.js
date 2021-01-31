var mongo = require("mongodb").MongoClient,
  client = require("socket.io").listen(9000).sockets;

mongo.connect("mongodb://127.0.0.1/chat", function (err, db) {
  if (err) throw err;

  client.on("connection", function (socket) {
    console.log("client connected");
    var col = db.collection("messages");

    var oldMsg = col
      .find()
      .limit(200)
      .toArray(function (mongoError, res) {
        socket.emit("output", res);
      });
    socket.emit("status", "Connected");

    //Wait for input
    socket.on("input", function (data) {
      var name = data.name,
        message = data.message,
        whitespacePattern = /^\s*$/;

      if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
        console.log("invalid");
        socket.emit("status", "Enter A Name and Some Message");
      } else {
        col.insertOne({ name: name, message: message }, function () {
          console.log("Inserted");
          client.emit("output", [{ name: name, message: message }]);
        });
      }
    });
  });
});
