//paperscript (paperjs)

//'index' page

// colorizing
var string_color = 'black';
//var string_color = 'white'; //theme dark?
var networkdot_color = 'hotpink';
var networkdot_stroke_color = 'white';
// var networkdot_color = '#51D0FD';
// var networkdot_stroke_color = '#FFE40A';
var mixer_bg = true;
var mixer_bg_color = new Color(1, 0.95, 0.71, 0.5); // buttermilk, opacity 50%

$(document).ready(function() {

  //metrics related to 'view size'
  // 'coarse'
  var vs = view.size;
  var vsw = vs.width;
  var vsh = vs.height;
  // 'fine'
  var vss = view.size / 10;
  var vssw = vss.width;
  var vssh = vss.height;

  //pre-load resources (images + audios)
  Promise.all([

    //imgs
    RasterImport_size1('./imgs/logo.png'),
    SVGImport_size1('./imgs/arrow-circle-right.svg'),
    SVGImport_size1('./imgs/arrow-circle-left.svg'),
    SVGImport_size1('./imgs/hand-point-right-regular.svg'),
    SVGImport_size1('./imgs/listen-icon.svg'),
    SVGImport_size1('./imgs/plus.svg'),
    SVGImport_size1('./imgs/minus.svg'),
    SVGImport_size1('./imgs/faster.svg'),
    SVGImport_size1('./imgs/slower.svg'),

    //clap
    // AudioImport_p5("./audio/clap@2/" + ("0" + getRandomInt(1, 2)).slice(-2) + ".mp3"),

    //sounds page ==> 7
    AudioImport("./audio/01.mp3"),
    AudioImport("./audio/02.mp3"),
    AudioImport("./audio/03.mp3"),
    AudioImport("./audio/04.mp3"),
    AudioImport("./audio/05.mp3"),
    AudioImport("./audio/06.mp3"),
    AudioImport("./audio/07.mp3"),
    //
  ]).then(function(imports) {

    //imgs
    var logo = imports[0];
    var anext = imports[1];
    var aprev = imports[2];
    var hand = imports[3];
    var iconsound = imports[4];
    var plus = imports[5];
    var minus = imports[6];
    var faster = imports[7];
    var slower = imports[8];

    //clap
    // var clap = imports[9];

    //audio-files dictionary {key: value}
    //N.B.: Duplicate keys are not allowed!
    //      i.e. if '01' appearing twice will be a problem.
    var sounds = {
      '01': imports[9],
      '02': imports[10],
      '03': imports[11],
      '04': imports[12],
      '05': imports[13],
      '06': imports[14],
      '07': imports[15],
    };
    //audio-players' bank
    var players = {
      '01': [],
      '02': [],
      '03': [],
      '04': [],
      '05': [],
      '06': [],
      '07': [],
    };

    //top layer
    var top = new Layer(); // new Layer() will be automatically activated at the moment.

    //networking - socket.io
    var socket = io(window.location.protocol + "//" + window.location.host);

    //net. connection marker
    var netstat = new Path.Circle({
      center: view.bounds.topRight + [-vssw / 2, +vssw / 2],
      radius: vssw / 4,
      fillColor: networkdot_color,
      strokeWidth: vssw * 0.03,
      strokeColor: networkdot_stroke_color,
      dashArray: [vssw * 0.05, vssw * 0.05],
      onFrame: function(event) {
        // this.rotate(0.2);
      }
    });
    netstat.fillColor.alpha = 0;

    //
    socket.on('connect', function() {
      console.log("i' m connected!");
      top.activate();
      netstat.fillColor.alpha = 1;
      socket.on('disconnect', function() {
        console.log("i' m disconnected!");
        top.activate();
        netstat.fillColor.alpha = 0;
      });
    });

    //screen #1 - 'home'

    //✧*｡٩(ˊᗜˋ*)و✧*｡

    if (mixer_bg == true) {
      new Path.Rectangle([0, 0], vs).fillColor = mixer_bg_color;
    }

    //
    for (var row = 0; row < 7; row++) {
      for (var col = 0; col < 1; col++) {
        var idx = row * 1 + col;

        //play/stop/playcount/faster/slower button (networked between groups)
        var c = new Group({
          children: [
            //play button
            new Group({
              name: 'play_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 0.8, row * vssw * 1.4 + vssw * 1.2],
                  radius: vssw * 0.4,
                  size: [vssw * 1.5, vssw * 0.7],
                  fillColor: new Color({
                    hue: getRandom(20, 60),
                    saturation: 1,
                    brightness: 1
                  }),
                }),
                plus.clone()
              ],
              onMouseDown: function(event) {
                var par = this.parent;
                par._players.push(par._player.start()._source); // start playbacks and collect their '_source's..
                par._playcount++;
                par.children.playcounter.content = '' + par._playcount;
                par.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'start',
                  group: 'mix-bowl'
                });
              }
            }),
            //playcounterbox
            new Path.Rectangle({
              name: 'playcounterbox',
              point: [vssw * 2.3, row * vssw * 1.4 + vssw * 1.2],
              size: [vssw * 0.6, vssw * 0.8],
            }),
            //playcounter
            new PointText({
              name: 'playcounter',
              content: '' + 0,
              fillColor: string_color,
              fontSize: '2em',
              fontWeight: 'bold'
            }),
            //stop button
            new Group({
              name: 'stop_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 2.9, row * vssw * 1.4 + vssw * 1.2],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  fillColor: new Color({
                    hue: getRandom(120, 180),
                    saturation: 1,
                    brightness: 1
                  }),
                }),
                minus.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  (par._players.shift()).stop();
                  par._playcount--;
                  par.children.playcounter.content = '' + par._playcount;
                }
                if (par._players.length == 0) {
                  par.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'stop',
                  group: 'mix-bowl'
                });
              }
            }),
            //faster button
            new Group({
              name: 'faster_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 5.0, row * vssw * 1.4 + vssw * 1.2],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  strokeColor: new Color({
                    hue: getRandom(20, 60),
                    saturation: 1,
                    brightness: 1
                  }),
                  strokeWidth: vssw * 0.03,
                  fillColor: new Color(1, 1, 1, 0.5)
                }),
                faster.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  par._players[par._players.length - 1].playbackRate.value += 0.2;
                  par.children.speedcounter.content = Number.parseFloat(par._players[par._players.length - 1].playbackRate.value).toFixed(1);
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'faster',
                  group: 'mix-bowl'
                });
              }
            }),
            //speedcounterbox
            new Path.Rectangle({
              name: 'speedcounterbox',
              point: [vssw * 6.6, row * vssw * 1.4 + vssw * 1.2],
              size: [vssw * 0.6, vssw * 0.8],
            }),
            //speedcounter
            new PointText({
              name: 'speedcounter',
              content: '' + 0,
              fillColor: string_color,
              fontSize: '2em',
              fontWeight: 'bold'
            }),
            //slower button
            new Group({
              name: 'slower_btn',
              children: [
                new Path.Rectangle({
                  point: [vssw * 7.8, row * vssw * 1.4 + vssw * 1.2],
                  radius: vssw * 0.4,
                  size: [vssw * 1.6, vssw * 0.7],
                  strokeColor: new Color({
                    hue: getRandom(120, 180),
                    saturation: 1,
                    brightness: 1
                  }),
                  strokeWidth: vssw * 0.03,
                  fillColor: new Color(1, 1, 1, 0.5)
                }),
                slower.clone()
              ],
              onMouseDown: function() {
                var par = this.parent;
                if (par._players.length > 0) {
                  var val = par._players[par._players.length - 1].playbackRate.value;
                  if (val > 0.2) {
                    par._players[par._players.length - 1].playbackRate.value = val - 0.2;
                  }
                  par.children.speedcounter.content = Number.parseFloat(par._players[par._players.length - 1].playbackRate.value).toFixed(1);
                }
                //
                par._socket.emit('sound', {
                  name: par._key,
                  action: 'slower',
                  group: 'mix-bowl'
                });
              }
            })
          ],
          _socket: socket,
          _key: Object.keys(sounds)[idx],
          _player: sounds[Object.keys(sounds)[idx]],
          _players: players[Object.keys(players)[idx]],
          _playcount: 0,
          _init: function() {
            this._player.loop = true;
            this._player.retrigger = true;
            // set icons
            this.children.play_btn.children[1].fitBounds(this.children.play_btn.children[0].bounds);
            this.children.stop_btn.children[1].fitBounds(this.children.stop_btn.children[0].bounds);
            this.children.faster_btn.children[1].fitBounds(this.children.faster_btn.children[0].bounds);
            this.children.faster_btn.children[1].fillColor = "orange";
            this.children.slower_btn.children[1].fitBounds(this.children.slower_btn.children[0].bounds);
            this.children.slower_btn.children[1].fillColor = "lime";
            // positioning numberboxes...
            this.children.playcounter.fitBounds(this.children.playcounterbox.bounds);
            this.children.speedcounter.fitBounds(this.children.speedcounterbox.bounds);
            this.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
            //socket io event handling..
            var that = this;
            this._socket.on('sound', function(msg) {
              if (msg.group == 'mix-bowl' && msg.name == that._key) {
                if (msg.action == 'start') {
                  that._players.push(that._player.start()._source); // start playbacks and collect their '_source's..
                  that._playcount++;
                  that.children.playcounter.content = '' + that._playcount;
                  that.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                } else if (msg.action == 'stop') {
                  if (that._players.length > 0) {
                    (that._players.shift()).stop();
                    that._playcount--;
                    that.children.playcounter.content = '' + that._playcount;
                  }
                  if (that._players.length == 0) {
                    that.children.speedcounter.content = Number.parseFloat(1).toFixed(1);
                  }
                } else if (msg.action == 'faster') {
                  if (that._players.length > 0) {
                    that._players[that._players.length - 1].playbackRate.value += 0.2;
                    that.children.speedcounter.content = Number.parseFloat(that._players[that._players.length - 1].playbackRate.value).toFixed(1);
                  }
                } else if (msg.action == 'slower') {
                  if (that._players.length > 0) {
                    var val = that._players[that._players.length - 1].playbackRate.value;
                    if (val > 0.2) {
                      that._players[that._players.length - 1].playbackRate.value -= 0.2;
                    }
                    that.children.speedcounter.content = Number.parseFloat(that._players[that._players.length - 1].playbackRate.value).toFixed(1);
                  }
                }
              }
            });
          }
        });
        c._init();
        //label
        new PointText({
          point: c.firstChild.bounds.topLeft + [0, -5],
          content: Object.keys(sounds)[idx],
          fontSize: vssw * 0.55,
          fontWeight: 'bold',
          fillColor: string_color
        });
      }
    }

    //reveal the curtain.
    $('#page-loading').css('z-index', -1);

    //network event handlers

    // //event: 'sound'
    // socket.on('sound', function(sound) {
    //   if (sound.name == 'clap') {
    //     if (sound.action == 'start') {
    //       clap.start();
    //     }
    //   }
    // });

  });

});
