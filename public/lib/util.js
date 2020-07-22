// re-map values from 'from' to 'to'
//
// usage form #1 : map(val, from, to, loop)
// 'from', 'to' should be array with 2 numbers. like: [0, 1], [-10, 30], [0.5, 52.4] ...
// 'loop' could be 'true' to extrapolate beyond from[1] and to[1]
//
// examples
//
// map(val, [30, 40], [2, 3]); // assuming 'val' is in the range [30, 40], what is propotionally matching number in the range [2, 3];
//
// map(32, [30, 40], [2, 3]) -> 2.2
// map(32, [30, 40], [3, 2]) -> 2.8 // flip
// map(29, [30, 40], [2, 3]) -> 2 // below mininum input range will forced to minimum output value
// map(43, [30, 40], [2, 3]) -> 3 // below maximun input range will forced to maximun output value
// map(43, [30, 40], [2, 3], true) -> 2.3 // allowing 'looping'
// map(33, [30, 40], [2, 3], true) -> 2.3 // looping portion (43-40 -> 3) will be reapplied (30 + 3) will result same as above line
// map(13, [30, 40], [2, 3], true) -> 2 // looping only allow 'beyond maximum'.. not 'under minimum'
//
// usage form #2 : map(val, object)
// 'object' should contain following items
// object.from
// object.to
// object.loop
// same as above but use instead 'object' form
//
// examples
//
// map(33, {
//   from: [30, 40],
//   to: [2, 3],
//   loop: true
// });

function map(val, from, to, loop) {
  if (typeof from === 'object') {
    if (Array.isArray(from)) { // direct form (array)
      from = from || [0, 1];
      to = to || [0, 1];
      if (val < from[0]) return to[0];
      if (loop === true) { // 'looping'
        return (val - from[0]) % (from[1] - from[0]) * (to[1] - to[0]) / (from[1] - from[0]) + to[0];
      } else {
        if (val > from[1]) return to[1];
        return (val - from[0]) * (to[1] - to[0]) / (from[1] - from[0]) + to[0];
      }
    } else { // object form
      var object = from;
      object.from = object.from || [0, 1];
      object.to = object.to || [0, 1];
      if (val < object.from[0]) return object.to[0];
      if (object.loop === true) { // 'looping'
        return (val - object.from[0]) % (object.from[1] - object.from[0]) * (object.to[1] - object.to[0]) / (object.from[1] - object.from[0]) + object.to[0];
      } else {
        if (val > object.from[1]) return object.to[1];
        return (val - object.from[0]) * (object.to[1] - object.to[0]) / (object.from[1] - object.from[0]) + object.to[0];
      }
    }
  }
}

// re-map values from [0, 1] to 'to'
// refer to 'map' description to understand 'loop'
// ex) known values lies in [0, 1] -> [2, 3] : map2(val, [2, 3]);
function map2(val, to, loop) {
  if (typeof to === 'object') {
    if (Array.isArray(to)) { // direct form (array)
      return map(val, [0, 1], to, loop);
    } else { // object form
      return map(val, [0, 1], to.to, to.loop);
    }
  }
}

// get a random real number in range of [min, max)
function getRandom(min, max) {
  return map2(Math.random(), [min, max]);
}

// get a random integer value in set of {min, ... , max}
function getRandomInt(min, max) {
  return Math.floor(getRandom(min, max + 1));
}

//use in onFrame(event) to get loopping 'timeline' for animation build-up
// ex) getTimeline(event.time, [0, 30]) will return a changing number from 0 to 1, for 30 seconds.
// time: could be event.time or event.count
// event.time.. will be more time-wise precise
// event.count.. will be more frame-wise precise
// ex) getTimeline(event.count, [0, 30]) will return a changing number from 0 to 1, for 30 frames (roughly 0.5 sec. in 60 fps animation).
//
// examples
//
// getTimeline(event.time, [0, 30]) // from 0 sec. to 30 sec., change value from 0 to 1
// getTimeline(event.time, [0, 30], [3, 2]) // from 0 sec. to 30 sec., change value from 3 to 2
// getTimeline(event.time, [0, 30], [3, 2], true) // from 0 sec. to 30 sec., change value from 3 to 2, and repeat forever.
// getTimeline(event.time, [3, 10]) // from 0 sec. to 3 sec. stay at 0, from 3 sec. to 10 sec., change value from 0 to 1
// getTimeline(event.time, { // object form
//   from: [3, 10],
//   to: [4, 15],
//   loop: true
// });
function getTimeline(time, from, to, loop) {
  return map(time, from, to, loop);
}

//use in onFrame(event) to get loopping 'timeline' for animation build-up
// ex) getTimepoint(event.time, [0, 10], path) will return a moving point along with 'path' for 10 seconds
// and use is as a point, like
// ex) a.position = getTimepoint(event.time, [0, 10], path);
// or get y-coord and use it as a number, like
// ex) a.fillColor.hue = getTimepoint(event.time, [0, 10], path).y;
// if expected range of y values are.. [0, 100], then..
// a.fillColor.hue = map(getTimepoint(event.time, [0, 10], path).y, [0, 100], [0, 360]);
// to fit whole range of hue circle.
function getTimepoint(time, path, from, to, loop) {
  return path.getPointAt(getTimeline(time, from, to, loop) * path.length % path.length);
}

// //detect 'visibilitychange' in modern browsers (e.g. changing tab)
// // ref) https://stackoverflow.com/a/19519701 ("Detect if browser tab is active or user has switched away")
// // ex)
// // __visibility(function() {
// //   document.title = __visibility() ? 'Visible' : 'Not visible';
// // });
// var __visibility = (function() {
//   //investigate property list in the browser
//   var stateKey, eventKey, keys = {
//     hidden: "visibilitychange",
//     webkitHidden: "webkitvisibilitychange",
//     mozHidden: "mozvisibilitychange",
//     msHidden: "msvisibilitychange"
//   };
//   //confirm what eventkey to be used
//   for (stateKey in keys) {
//     if (stateKey in document) {
//       eventKey = keys[stateKey];
//       break;
//     }
//   }
//   //build the function and then let it be used
//   return function(c) {
//     //this function will have 2 usecases
//     // 1) simple call: __visibility() will return current visibility state
//     // 2) call with callback: __visibility(function(){}) will assign a callback for the event
//     //in this callback function use usecase #1 to get actual visibility.
//     if (c) {
//       document.addEventListener(eventKey, c);
//     }
//     return !document[stateKey];
//   }
// })();
//
// //prepare a new master to be used
// var master = new Tone.AmplitudeEnvelope({
//   attack: 1,
//   decay: 0,
//   sustain: 1,
//   release: 1
// }).toMaster();
//
// function onVisibilityChange() {
//   //document.title = __visibility() ? 'Visible' : 'Not visible';
//   if (__visibility() == true) {
//     master.triggerAttack();
//   } else {
//     master.triggerRelease();
//   }
// }
// //register handler
// __visibility(onVisibilityChange);
// //initial state check
// onVisibilityChange();
//
// //a first touch getter! (only for iphone)
// function getTheFirstTouchiOS() {
//   if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
//     var _silence = new Tone.Player({
//       url: 'lib/_silence.wav',
//       onload: function() {
//         new paper.Path.Rectangle({
//           point: [0, 0],
//           size: paper.view.size,
//           fillColor: 'white',
//           opacity: 0.8,
//           onClick: function() {
//             _silence.start();
//             this.remove();
//           }
//         }).bringToFront();
//       }
//     }).toMaster();
//   }
// }

//SVG helpers
function SVGSymbol(uri) {
  return new Promise(function(resolve, reject) {
    paper.project.importSVG(uri, {
      expandShapes: true,
      onLoad: function(svg) {
        resolve(new paper.Symbol(svg));
      }
    });
  });
}

function SVGSymbol_size1(uri) {
  return new Promise(function(resolve, reject) {
    paper.project.importSVG(uri, {
      expandShapes: true,
      onLoad: function(svg) {
        svg.scale(1 / svg.bounds.size.width);
        resolve(new paper.Symbol(svg));
      }
    });
  });
}

function SVGImportSimple(uri) {
  return new Promise(function(resolve, reject) {
    paper.project.importSVG(uri, function(svg) {
      resolve(svg);
    });
  });
}

function SVGImport(uri) {
  return new Promise(function(resolve, reject) {
    paper.project.importSVG(uri, function(svg) {
      svg.parent.remove(svg);
      resolve(svg);
    });
  });
}

function SVGImport_size1(uri) {
  return new Promise(function(resolve, reject) {
    paper.project.importSVG(uri, function(svg) {
      svg.parent.remove(svg);
      svg.scale(1 / svg.bounds.size.width);
      resolve(svg);
    });
  });
}

function SVGNamedImport(uri, name) {
  return new Promise(function(resolve, reject) {
    paper.project.importSVG(uri, function(svg) {
      svg.remove();
      var item = svg.getItem({
        name: name
      });
      item.applyMatrix = true;
      resolve(item);
    });
  });
}

function SVGNamedSymbol(uri, name) {
  return new Promise(function(resolve, reject) {
    paper.project.importSVG(uri, function(svg) {
      resolve(new paper.Symbol(
        svg.getItem({
          name: name
        })
      ));
    });
  });
}

function RasterImport(uri) {
  return new Promise(function(resolve, reject) {
    var raster = new paper.Raster(uri);
    raster.onLoad = function() {
      raster.remove();
      raster.applyMatrix = true;
      resolve(raster);
    };
  });
}

function RasterImport_size1(uri) {
  return new Promise(function(resolve, reject) {
    var raster = new paper.Raster(uri);
    raster.onLoad = function() {
      raster.remove();
      raster.applyMatrix = true;
      raster.scale(1 / raster.size.width);
      resolve(raster);
    };
  });
}

function AudioImport(url) {
  return new Promise(function(resolve, reject) {
    var audio = new Tone.Player(url, function() {
      resolve(audio);
    }).toMaster();
  });
}

// function AudioImport_p5(url) {
//   return new Promise(function(resolve, reject) {
//     var audio = new p5.SoundFile(url, function() {
//       resolve(audio);
//     });
//   });
// }

//
// a unique string generator
//
// references:
// https://gist.github.com/gordonbrander/2230317
// https://gist.github.com/6174/6062387
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
//
function uniqueID() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
