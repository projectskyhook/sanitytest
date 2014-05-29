function BillAcceptor() {
  this.msgType = 1 // Indicates "overlord", or computer controlling acceptor
  this.ackBit = 0
}

BillAcceptor.prototype.getAckBit = function() {
  var currentAckBit = this.ackBit
  this.ackBit = (this.ackBit == 0 ? 1 : 0)
  return currentAckBit
}

var msgAck = msgAck || 0x11

function flipTheAck() {
  msgAck = (msgAck == 0x10) ? 0x11 : 0x10
  return msgAck
}

BillAcceptor.prototype.flipAck = function() {
  this.msgAck = this.msgAck || 0x11
  return (this.msgAck == 0x10) ? 0x11 : 0x10
}

BillAcceptor.prototype.connect = function() {
  var self = this

  chrome.serial.onReceiveError.addListener(function(info) {
    console.log('RECEIVE ERROR')
    console.log(info)
  })

  chrome.serial.getDevices(function(devices) {
    if(devices.length == 0) {
      throw new Error('no devices found')
    }

    chrome.serial.connect(devices[0].path, {
      bitrate: 9600,
      dataBits: "seven",
      parityBit: "even",
      stopBits: "one",
      receiveTimeout: 5500
    }, function(conn) {
      console.log(conn)

      chrome.serial.setControlSignals(conn.connectionId, {dtr: true, rts:true}, function (result) {

        setInterval(function() {

        var acceptableBills = 0x7F

        var derpAck = flipTheAck()
        console.log('ACK: '+derpAck)

        var msg = [0x02, 0x08, derpAck, acceptableBills, 0x10, 0x00, 0x03]

        var checksum = 0x00

        for(var i=1;i<msg.length - 1;i++)
          checksum = checksum ^ msg[i]

        msg.push(checksum)

        var sendMsg = new Uint8Array(msg)
        console.log('LETS GO')
        console.log(conn.connectionId)
        console.log(sendMsg.constructor)
        console.log(sendMsg)

          chrome.serial.send(
          conn.connectionId,
          sendMsg.buffer,
          function(sendInfo) {
            console.log('HELLO!')
            console.log(sendInfo)
          }
        )

        }, 50)




      })



/*
      var msg = self.msgType << 4
      msg |= self.getAckBit()

      console.log('sending: '+Uint8Array([2, 8, msg, 127, 0, 0, 3]).toString(2))
      chrome.serial.send(
        conn.connectionId,
        Uint8Array([2, 6, msg, 127, 0, 0, 3]),
        function(sendInfo) {
          console.log(sendInfo)
        }
      )
*/
    })
  })
}