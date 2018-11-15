var hypercore = require("hypercore");
var multifeed = require("multifeed");
var discovery = require("discovery-swarm");
var pump = require("pump");

var suffix = process.argv[2];

var multi = multifeed(hypercore, "./multichat-" + suffix, {
  valueEncoding: "json"
});

multi.writer("local", function(err, w) {
  process.stdin.on("data", function(data) {
    w.append(
      {
        type: "chat-message",
        nickname: "cat-lover",
        text: data.toString(),
        timestamp: new Date().toISOString()
      },
      function(err, seq) {
        if (err) throw err;
        console.log("Data was appended as entry #" + seq);
      }
    );
  });
});

// var feed = hypercore(
//   "./single-chat-feed",
//   "3ada72c792f9d1f02a09a567aa9a54ead6b42a4856306aadf35b9b6b7e6257ce",
//   {
//     valueEncoding: "json"
//   }
// );

// feed.append(
//   {
//     type: "chat-message",
//     nickname: "cat-lover",
//     text: "hello world",
//     timestamp: "2018-11-05T14:26:000Z" // new Date().toISOString()
//   },
//   function(err, seq) {
//     if (err) throw err;
//     console.log("Data was appended as entry #" + seq);
//   }
// );

process.stdin.on("data", function(data) {
  //   multi.append({
  //     type: "chat-message",
  //     nickname: "cat-lover",
  //     text: data.toString().trim(),
  //     timestamp: new Date().toISOString()
  //   });
});

// feed.createReadStream({ live: true }).on("data", function(data) {
//   console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`);
// });

// feed.ready(function() {
//   console.log("public key:", feed.key.toString("hex"));
//   console.log("discovery key:", feed.discoveryKey.toString("hex"));
//   console.log("secret key:", feed.secretKey.toString("hex"));
// });

var swarm = discovery();

multi.ready(function() {
  var feeds = multi.feeds();
  feeds.forEach(function(feed) {
    feed.createReadStream({ live: true }).on("data", function(data) {
      console.log(`<${data.timestamp}> ${data.nickname}: ${data.text}`);
    });
    // feed is a hypercore! (remember reading from hypercores in previous exercises?)
  });
  // we use the discovery as the topic
  swarm.join("venelin-123");
  swarm.on("connection", function(connection) {
    console.log("(New peer connected!)");

    // We use the pump module instead of stream.pipe(otherStream)
    // as it does stream error handling, so we do not have to do that
    // manually.

    // See below for more detail on how this work.
    pump(connection, multi.replicate({ live: true }), connection, function(
      err
    ) {
      console.log(err);
    });
  });
});
