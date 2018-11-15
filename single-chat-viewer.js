var discovery = require("discovery-swarm");
var hypercore = require("hypercore");
var pump = require("pump");

var feed = hypercore(
  "./single-chat-feed-clone",
  "3ada72c792f9d1f02a09a567aa9a54ead6b42a4856306aadf35b9b6b7e6257ce",
  {
    valueEncoding: "json"
  }
);

feed.createReadStream({ live: true }).on("data", function(data) {
  console.log(data);
});

var swarm = discovery();

feed.ready(function() {
  // we use the discovery as the topic
  swarm.join(feed.discoveryKey);
  swarm.on("connection", function(connection) {
    console.log("(New peer connected!)");

    // We use the pump module instead of stream.pipe(otherStream)
    // as it does stream error handling, so we do not have to do that
    // manually.

    // See below for more detail on how this work.
    pump(connection, feed.replicate({ live: true }), connection);
  });
});
