var discovery = require("discovery-swarm");

var swarm = discovery();

swarm.listen(1000);
swarm.join("my-p2p-app-venelin");

// this event is fired every time you find and connect to a new peer also on the same key
swarm.on("connection", function(connection, info) {
  // `info `is a simple object that describes the peer we connected to
  //   console.log("found a peer", info);
  // `connection` is a duplex stream that you read from and write to
  connection.write("hello");
  connection.on("data", function(data) {
    console.log(data.toString().trim());
  });
});
