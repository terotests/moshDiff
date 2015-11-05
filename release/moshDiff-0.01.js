'use strict';

(function () {

  var __amdDefs__ = {};

  var moshDiff_prototype = function moshDiff_prototype() {

    (function (_myTrait_) {
      var _eventOn;
      var _commands;

      // Initialize static variables here...

      /**
       * @param float t
       */
      _myTrait_.guid = function (t) {

        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        //return Math.random();
        // return Math.random().toString(36);

        /*    
        return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
        */
        /*        
        function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();*/
      };

      /**
       * @param float t
       */
      _myTrait_.isArray = function (t) {

        if (typeof t == 'undefined') return this.__isA;

        return Object.prototype.toString.call(t) === '[object Array]';
      };

      /**
       * @param float fn
       */
      _myTrait_.isFunction = function (fn) {
        return Object.prototype.toString.call(fn) == '[object Function]';
      };

      /**
       * @param float t
       */
      _myTrait_.isObject = function (t) {

        if (typeof t == 'undefined') return this.__isO;

        return t === Object(t);
      };
    })(this);

    (function (_myTrait_) {
      var _all;
      var _data1;
      var _data2;
      var _up;
      var _reals;
      var _missing;
      var _added;
      var _parents;

      // Initialize static variables here...

      /**
       * @param float obj
       * @param float parentObj
       * @param float intoList
       */
      _myTrait_._createModelCommands = function (obj, parentObj, intoList) {

        /*
        _cmdIndex = {}; 
        _cmdIndex["createObject"] = 1;
        _cmdIndex["createArray"]  = 2;
        _cmdIndex["initProp"]  = 3;
        _cmdIndex["set"]  = 4;
        _cmdIndex["setMember"]  = 5;
        _cmdIndex["push"]  = 6;
        _cmdIndex["pushObj"]  = 7;
        _cmdIndex["removeItem"]  = 8;
         // reserved 9 for optimizations
        _cmdIndex["last"]  = 9;
         _cmdIndex["removeProperty"]  = 10;
        _cmdIndex["insertObjectAt"]  = 11;
        _cmdIndex["moveToIndex"]  = 12;
        */

        if (!intoList) intoList = [];

        var data;

        if (obj.data && obj.__id) {
          data = obj.data;
        } else {
          data = obj;
        }

        if (this.isObject(data) || this.isArray(data)) {

          var newObj;

          if (obj.__id) {
            newObj = obj;
          } else {
            newObj = {
              data: data,
              __id: this.guid()
            };
          }

          if (this.isArray(data)) {
            var cmd = [2, newObj.__fork || newObj.__id, [], null, newObj.__fork || newObj.__id];
          } else {
            var cmd = [1, newObj.__fork || newObj.__id, {}, null, newObj.__fork || newObj.__id];
          }
          if (parentObj) {
            newObj.__p = parentObj.__id;
            // this._moveCmdListToParent( newObj );
          }
          intoList.push(cmd);

          // Then, check for the member variables...
          for (var n in data) {
            if (data.hasOwnProperty(n)) {
              var value = data[n];
              if (this.isObject(value) || this.isArray(value)) {
                // Then create a new...
                var oo = this._createModelCommands(value, newObj, intoList);
                var cmd = [5, n, oo.__fork || oo.__id, null, newObj.__fork || newObj.__id];
                intoList.push(cmd);
              } else {
                var cmd = [4, n, value, null, newObj.__fork || newObj.__id];
                intoList.push(cmd);
              }
            }
          }

          return newObj;
        } else {}

        /*
        var newObj = {
        data : data,
        __id : this.guid()
        }
        */
      };

      /**
       * @param float t
       */
      _myTrait_.addedObjects = function (t) {

        var res = [];

        for (var id in _data2) {
          if (_data2.hasOwnProperty(id)) {
            if (!_data1[id]) {
              res.push(id);
              _added[id] = _data2[id];
            }
          }
        }

        return res;
      };

      /**
       * @param float t
       */
      _myTrait_.commonObjects = function (t) {
        var res = [];

        for (var id in _all) {
          if (_data1[id] && _data2[id]) {
            res.push(id);
          }
        }

        return res;
      };

      /**
       * @param float data1
       * @param float data2
       */
      _myTrait_.compareFiles = function (data1, data2) {

        // these are static global for the diff engine, the results are one-time only
        _data1 = {};
        _data2 = {};
        _all = {};
        _reals = {};
        _missing = {};
        _added = {};
        _parents = {};

        this.findObjects(data1, _data1);
        this.findObjects(data2, _data2);

        var details = {
          missing: this.missingObjects(),
          added: this.addedObjects(),
          common: this.commonObjects(),
          cMod: [],
          cmds: []
        };

        var me = this;
        details.common.forEach(function (id) {
          var diff = me.objectDiff(_data1[id], _data2[id]);
          details.cMod.push(diff);
        });

        var me = this;
        details.added.forEach(function (cid) {
          var cmdList = [];
          var obj = _all[cid];
          me._createModelCommands(obj, null, cmdList);

          cmdList.forEach(function (cmd) {
            details.cmds.push(cmd);
          });
        });
        details.cMod.forEach(function (c) {
          c.cmds.forEach(function (cc) {
            details.cmds.push(cc);
          });
        });

        return details;
      };

      /**
       * @param float data
       * @param float saveTo
       * @param float parentObj
       */
      _myTrait_.findObjects = function (data, saveTo, parentObj) {

        if (data && data.__id) {
          saveTo[data.__fork || data.__id] = data;
          _all[data.__fork || data.__id] = data;
          _reals[data.__id] = data;
        }

        if (data.data) {
          var sub = data.data;
          for (var n in sub) {
            if (sub.hasOwnProperty(n)) {
              var p = sub[n];
              if (this.isObject(p)) {
                _parents[p.__fork || p.__id] = data.__fork || data.__id;
                this.findObjects(p, saveTo);
              }
            }
          }
        }
      };

      if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty('__traitInit')) _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
      if (!_myTrait_.__traitInit) _myTrait_.__traitInit = [];
      _myTrait_.__traitInit.push(function (t) {});

      /**
       * @param float t
       */
      _myTrait_.missingObjects = function (t) {

        var res = [];

        for (var id in _data1) {
          if (_data1.hasOwnProperty(id)) {
            if (!_data2[id]) {
              _missing[id] = _data1[id];
              res.push(id);
            }
          }
        }

        return res;
      };

      /**
       * @param float obj1
       * @param float obj2
       */
      _myTrait_.objectDiff = function (obj1, obj2) {
        var res = {
          modified: [],
          posMoved: [],
          sourcesAndTargets: [],
          cmds: []
        };

        if (obj1.data && obj2.data && this.isObject(obj1.data) && !this.isArray(obj1.data)) {
          var sub = obj1.data,
              hadProps = {};
          for (var n in obj2.data) {
            if (obj2.data.hasOwnProperty(n)) {
              var v = sub[n],
                  objid = obj1.__fork || obj1.__id;
              if (!this.isObject(v) && !this.isArray(v)) {
                hadProps[n] = true;
                var v2 = obj2.data[n];
                if (obj2.data[n] != v) {
                  if (this.isObject(v) || this.isObject(v2)) {
                    if (v2 && v2.__id) {
                      res.cmds.push([5, n, obj2.data[n].__id, null, objid]);
                    } else {
                      res.cmds.push([10, n, v.__id, null, objid]);
                    }
                  } else {
                    res.modified.push({
                      id: objid,
                      prop: n,
                      from: v,
                      to: obj2.data[n]
                    });
                    res.cmds.push([4, n, obj2.data[n], v, objid]);
                  }
                }
              } else {}
            }
          }
          for (var n in obj1.data) {
            if (obj1.data.hasOwnProperty(n)) {
              if (hadProps[n]) continue;
              var v = obj1.data[n],
                  objid = obj1.__id;

              if (this.isObject(v) && !this.isArray(v)) {
                var v2 = obj2.data[n];
                if (!v2 && v && v.__id) {
                  res.cmds.push([10, n, v.__id, null, objid]);
                }
              }
            }
          }
        }
        if (this.isArray(obj1.data)) {

          var arr1 = obj1.data,
              arr2 = obj2.data,
              sourceArray = [],
              targetArray = [],
              len1 = arr1.length,
              len2 = arr2.length;
          // insert
          // [7, 0, <insertedID>, 0, <parentId>]

          // remove
          // [8, 0, <insertedID>, 0, <parentId>]       
          for (var i = 0; i < len1; i++) {
            var o = arr1[i];
            if (this.isObject(o)) {
              var activeId = o.__fork || o.__id;
              if (!_missing[activeId]) {
                sourceArray.push(activeId);
              } else {
                // res.cmds.push("remove "+activeId);
                res.cmds.push([8, 0, activeId, 0, _parents[activeId]]);
              }
            }
          }
          var indexArr = {},
              reverseIndex = {},
              sourceReverseIndex = {};
          for (var i = 0; i < len2; i++) {
            var o = arr2[i];
            if (this.isObject(o)) {
              var activeId = o.__fork || o.__id;
              indexArr[activeId] = i;
              reverseIndex[i] = activeId;
              if (_added[activeId]) {
                sourceArray.push(activeId);
                // res.cmds.push("insert "+activeId);
                res.cmds.push([7, i, activeId, 0, _parents[activeId]]);
              }
              targetArray.push(activeId);
            }
          }

          var list = [],
              i = 0;
          sourceArray.forEach(function (id) {
            list.push(indexArr[id]);
            sourceReverseIndex[id] = i;
            i++;
          });

          res.restackIndex = indexArr;
          res.restackList = list;
          res.reverseIndex = reverseIndex;
          res.restack = this.restackOps(list);

          // insert
          // [7, 0, <insertedID>, 0, <parentId>]

          // remove
          // [8, 0, <insertedID>, 0, <parentId>]

          // move
          // [12, <insertedID>, <index>, 0, <parentId>]      

          var cmdList = [],
              sourceArrayWork = sourceArray.slice();

          res.restack.forEach(function (c) {
            if (c[0] == 'a') {
              var moveItemId = reverseIndex[c[1]],
                  aboveItemId = reverseIndex[c[2]],
                  atIndex = indexArr[aboveItemId],
                  fromIndex = sourceArrayWork.indexOf(moveItemId);

              sourceArrayWork.splice(fromIndex, 1);
              var toIndex = sourceArrayWork.indexOf(aboveItemId);
              sourceArrayWork.splice(toIndex, 0, moveItemId);

              var obj = _all[moveItemId];

              res.cmds.push([12, moveItemId, toIndex, fromIndex, _parents[moveItemId]]);
              //             cmdList.push(" move item "+moveItemId+" above "+aboveItemId+ " from "+fromIndex+ " to "+toIndex);
            } else {
              var moveItemId = reverseIndex[c[1]],
                  aboveItemId = reverseIndex[c[2]],
                  atIndex = indexArr[aboveItemId],
                  fromIndex = sourceArrayWork.indexOf(moveItemId);
              sourceArrayWork.splice(fromIndex, 1);
              var toIndex = sourceArrayWork.indexOf(aboveItemId) + 1;
              sourceArrayWork.splice(toIndex, 0, moveItemId);
              // cmdList.push(" move item "+moveItemId+" above "+aboveItemId+ " from "+fromIndex+ " to "+toIndex); 
              res.cmds.push([12, moveItemId, toIndex, fromIndex, _parents[moveItemId]]);
            }
          });
          res.stackCmds = cmdList;
          res.sourceArrayWork = sourceArrayWork;

          res.sourcesAndTargets.push([sourceArray, targetArray]);
        }

        return res;
      };

      /**
       * @param float input
       */
      _myTrait_.restackOps = function (input) {
        var moveCnt = 0,
            cmds = [];

        function restack(input) {
          var data = input.slice(0);
          var dataIn = input.slice(0);
          var goalIn = input.slice(0).sort(function (a, b) {
            return a - b;
          });

          var mapper = {};
          var indexes = {};
          // Testing this kind of simple system...
          for (var i = 0; i < dataIn.length; i++) {
            var mm = goalIn.indexOf(dataIn[i]);
            mapper[dataIn[i]] = mm;
            indexes[mm] = dataIn[i];
            data[i] = mm;
          }

          var goal = data.slice(0).sort(function (a, b) {
            return a - b;
          });

          var minValue = data[0],
              maxValue = data[0],
              partDiffs = [],
              partCum = 0,
              avgDiff = (function () {
            var i = 0,
                len = data.length,
                df = 0;
            for (; i < len; i++) {
              var v = data[i];
              if (v > maxValue) maxValue = v;
              if (v < minValue) minValue = v;
              if (i > 0) partDiffs.push(goal[i] - goal[i - 1]);
              if (i > 0) partCum += Math.abs(goal[i] - goal[i - 1]);
              df += Math.abs(v - goal[i]);
            }
            partCum = partCum / len;
            return df / len;
          })();

          partDiffs.sort(function (a, b) {
            return a - b;
          });
          var minDelta = partDiffs[0];

          // collects one "acceptable" array
          var accept = function accept(fn) {
            var collect = function collect(i, sx, last) {
              var res = [];
              var len = data.length;
              if (!sx) sx = 0;
              for (; i < len; i++) {
                var v = data[i];
                if (v - last == 1) {
                  res.push(v);
                  last = v;
                  continue;
                }
                var gi = i + sx;
                if (gi < 0) gi = 0;
                if (gi >= len) gi = len - 1;
                if (fn(v, goal[gi], v, last, i, len)) {
                  if (data[i + 1] && data[i + 1] < v && data[i + 1] > last) {} else {
                    res.push(v);
                    last = v;
                  }
                }
              }
              return res;
            };

            var m = [];
            var ii = 0,
                a = 0;
            // small tricks to improve the algo, just for comp's sake...
            while (a < 0.1) {
              for (var sx = -5; sx <= 5; sx++) m.push(collect(Math.floor(data.length * a), sx, minValue - 1));
              a += 0.05;
            }
            m.sort(function (a, b) {
              return b.length - a.length;
            });
            return m[0];
          };

          // different search agents...
          var test = [accept(function (dv, gv, v, last, i, len) {
            // console.log(Math.abs(v-last)+" vs "+partCum);
            if (v < last) return false;
            if (i > 0) if (Math.abs(v - last) > partDiffs[i - 1]) return false;
            if (Math.abs(v - last) > avgDiff) return false;
            if (Math.abs(dv - gv) <= avgDiff * (i / len) && v >= last) return true;
            if (Math.abs(last - v) <= avgDiff * (i / len) && v >= last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v < last) return false;
            if (Math.abs(v - last) > avgDiff) return false;
            if (Math.abs(dv - gv) <= avgDiff * (i / len) && v >= last) return true;
            if (Math.abs(last - v) <= avgDiff * (i / len) && v >= last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v < last) return false;
            if (Math.abs(v - last) > avgDiff) return false;
            if (Math.abs(dv - gv) <= avgDiff * (i / len) && v >= last) return true;
            if (Math.abs(last - v) <= avgDiff * (i / len) && v >= last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v < last) return false;
            if (Math.abs(dv - gv) <= avgDiff * (i / len) && v >= last) return true;
            if (Math.abs(last - v) <= avgDiff * (i / len) && v >= last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v < last) return false;
            if (Math.abs(dv - gv) <= avgDiff && v >= last) return true;
            if (Math.abs(last - v) <= avgDiff * (i / len) && v >= last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v < last) return false;
            if (Math.abs(v - last) < partCum) return true;
            if (Math.abs(dv - gv) <= partCum && v >= last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v > last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v < last) return false;
            if (Math.abs(v - last) > avgDiff) return false;
            if (Math.abs(dv - gv) <= avgDiff && v >= last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v < last) return false;
            if (i > 0) if (Math.abs(v - last) > avgDiff) return false;
            if (Math.abs(dv - gv) <= avgDiff * (i / len) && v >= last) return true;
            if (i > 0) if (Math.abs(last - v) <= avgDiff * (i / len) && v >= last) return true;
            return false;
          }), accept(function (dv, gv, v, last, i, len) {
            if (v < last) return false;
            if (last >= minValue) {
              if (v >= last) return true;
            } else {
              if (v == minValue) return true;
            }
            return false;
          })];

          // choose between algorithms
          var okVals = [],
              maxSet = 0;
          for (var i = 0; i < test.length; i++) {
            var set = test[i];
            if (set.length > maxSet) {
              okVals = set;
              maxSet = set.length;
            }
          }
          // if nothing, take something
          if (okVals.length == 0) okVals = [goal[Math.floor(goal.length / 2)]];

          // divide the list to big and small
          var big = [],
              small = [];
          var divide = (function () {
            var min = minValue,
                max = okVals[0],
                okLen = okVals.length,
                oki = data.indexOf(max),
                index = 0;

            var i = 0,
                len = data.length;
            for (; i < len; i++) {
              var v = data[i];
              if (v >= min && v <= max && i <= oki) {
                big.push(v);
                min = v;
              } else {
                small.push(v);
              }
              if (v == max) {
                min = v;
                if (index < okLen - 1) {
                  index++;
                  max = okVals[index];
                  oki = data.indexOf(max);
                } else {
                  max = maxValue;
                  oki = len + 1;
                }
              }
            }
          })();

          // sort the small list before joining them
          small.sort(function (a, b) {
            return a - b;
          });

          //console.log(big);
          //console.log(small);

          var joinThem = (function () {
            var si = 0,
                bi = 0,
                lastb = big[0],
                slen = small.length;
            while (si < slen) {
              var b = big[bi],
                  s = small[si];
              if (typeof b == 'undefined') {
                while (si < slen) {
                  cmds.push(['b', indexes[s], indexes[lastb]]);
                  // restackXBelowY(dataIn, indexes[s], indexes[lastb]);
                  lastb = s;
                  si++;
                  s = small[si];
                }
                return;
              }
              if (b < s) {
                // console.log("B was smaller");
                lastb = b;
                bi++;
              } else {
                cmds.push(['a', indexes[s], indexes[b]]);
                // restackXAboveY(dataIn, indexes[s], indexes[b]);
                si++;
              }
            }
          })();

          // console.log(dataIn);
          return data; // actually the return value is not used for anything  
        }
        restack(input);

        return cmds;
      };
    })(this);
  };

  var moshDiff = function moshDiff(a, b, c, d, e, f, g, h) {
    var m = this,
        res;
    if (m instanceof moshDiff) {
      var args = [a, b, c, d, e, f, g, h];
      if (m.__factoryClass) {
        m.__factoryClass.forEach(function (initF) {
          res = initF.apply(m, args);
        });
        if (typeof res == 'function') {
          if (res._classInfo.name != moshDiff._classInfo.name) return new res(a, b, c, d, e, f, g, h);
        } else {
          if (res) return res;
        }
      }
      if (m.__traitInit) {
        m.__traitInit.forEach(function (initF) {
          initF.apply(m, args);
        });
      } else {
        if (typeof m.init == 'function') m.init.apply(m, args);
      }
    } else return new moshDiff(a, b, c, d, e, f, g, h);
  };

  moshDiff._classInfo = {
    name: 'moshDiff'
  };
  moshDiff.prototype = new moshDiff_prototype();

  (function () {
    if (typeof define !== 'undefined' && define !== null && define.amd != null) {
      __amdDefs__['moshDiff'] = moshDiff;
      this.moshDiff = moshDiff;
    } else if (typeof module !== 'undefined' && module !== null && module.exports != null) {
      module.exports['moshDiff'] = moshDiff;
    } else {
      this.moshDiff = moshDiff;
    }
  }).call(new Function('return this')());

  if (typeof define !== 'undefined' && define !== null && define.amd != null) {
    define(__amdDefs__);
  }
}).call(new Function('return this')());

// skip, if next should be taken instead