window.sample = window.sample || {};
window.sample = (function (window, undefined) {
  var $ = window;
  var _ = {};
  _.queue = { logs: [] };
  
  var $_Log = (function(lv) {
  var level = 1;
  console.log(lv);

  function init(lv){
    //這裡可以改用Regular
  	switch(lv) {
   			case 0:
   			case "INFO":
   				lv = 0;
   				break;
   			case 2:
   			case "TRACE":
   				lv = 2;
   				break;
   			default:
   				lv = 1;
   				break;
   		}
   	}
   	function log(m, lv) { _queue.logs.push("[" + lv + "] " + m); return $_Log; }
   	function q() { return _queue.logs; }
   	return { 
   		info: function(m) { return log(m, "INFO"); },
   		debug: function(m) { return log(m, "DEBUG"); },
   		trace: function(m) { return log(m, "TRACE"); },
   		error: function(m) { return log(m, "ERROR"); },
   		q: q
   	}
  })();
  
  return {
    log: {
      initialize: function(level) { return $_Log; },
      q: $_Log.q
    }
  }
})(window);
