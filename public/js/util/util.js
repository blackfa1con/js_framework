////////////topological sort for dependency relation/////////////////////
function toposort(nodes, edges) {
	var cursor = nodes.length
		, sorted = new Array(cursor)
		, visited = {}
		, i = cursor

		while (i--) {
			if (!visited[i]) visit(nodes[i], i, [])
		}

		return sorted

		function visit(node, i, predecessors) {
			if(predecessors.indexOf(node) >= 0) {
				throw new Error('Cyclic dependency: '+JSON.stringify(node))
			}

			if (visited[i]) return;
			visited[i] = true

				// outgoing edges
				var outgoing = edges.filter(function(edge){
					return edge[0] === node
				})
			if (i = outgoing.length) {
				var preds = predecessors.concat(node)
					do {
						var child = outgoing[--i][1]
							visit(child, nodes.indexOf(child), preds)
					} while (i)
			}

			sorted[--cursor] = node
		}
}

function uniqueNodes(arr){
	var res = []
	for (var i = 0, len = arr.length; i < len; i++) {
		var edge = arr[i]
			if (res.indexOf(edge[0]) < 0) res.push(edge[0])
				if (res.indexOf(edge[1]) < 0) res.push(edge[1])
	}
	return res
}
//////////////////////////////////////////////////////

function isFunction(o){
	return typeof o === 'function';
}


function oPromise(fn) {
    var state = 'pending';
    var value;
    var deferred = null;

    function resolve(newValue) {
        try {
            if (newValue && typeof newValue.then === 'function') {
                newValue.then(resolve, reject);
                return;
            }
            state = 'resolved';
            value = newValue;

            if (deferred) {
                handle(deferred);
            }
        } catch (e) {
            reject(e);
        }
    }

    function reject(reason) {
        state = 'rejected';
        value = reason;

        if (deferred) {
            handle(deferred);
        }
    }

    function handle(handler) {
        if (state === 'pending') {
            deferred = handler;
            return;
        }

	setTimeout(function(){
		var handlerCallback;

		if (state === 'resolved') {
		    handlerCallback = handler.onResolved;
		} else {
		    handlerCallback = handler.onRejected;
		}

		if (!handlerCallback) {
		    if (state === 'resolved') {
			handler.resolve(value);
		    } else {
			handler.reject(value);
		    }

		    return;
		}

		var ret;
		try {
		    ret = handlerCallback(value);
		    handler.resolve(ret);
		} catch (e) {
		    handler.reject(e);
		}
	},0);
    }
    this.catch = function(onRejected){
	new oPromise(function (resolve, reject) {
            handle({
                onResolved: undefined,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            });
        });
    };

    this.then = function (onResolved, onRejected) {
        return new oPromise(function (resolve, reject) {
            handle({
                onResolved: onResolved,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
            });
        });
    };

    fn(resolve, reject);
}
