# job-schedule
Schedule job for run one time.

This is similar to [PriorityQueue](https://caolan.github.io/async/docs.html#priorityQueue)
> Creates a queue object with the specified concurrency. Tasks added to the queue are processed in parallel (up to the concurrency limit). If all workers are in progress, the task is queued until one becomes available. Once a worker completes a task, that task's callback is called.

However, it can specific running-condition for the task. This is very useful to schedule the time based jobs for run one time only.

# Install
```shell
$ npm i -S job-schedule
```

# API
```javascript
// parameters and return value if similar to `priorityQueue`
let q = new Queue(worker, concurrency)

// Start task when this function returns `true`
// Call `cb` to resume the queue `q`
q.when = function (node, cb) {
  if (someConditions(node)) {
    return true
  }
  doSomething(() => cb())
}
```

# Example
```javascript
const Queue = require('../index')

var timerId = null
var q = new Queue((task, cb) => {
  console.log('priority:hello', task.name)
  cb()
}, 1)

q.when = function (node, cb) {
  // start task if it's priority less than 2
  if (node.priority -- < 2) {
    clearTimeout(timerId)
    console.log('start:', node.data.name)
    return true
  }
  // resume queue after 1s
  timerId = setTimeout(cb, 1000)
}

// call when all tasks finished
q.drain = function () {
  console.log('all items have been processed')
}

// add some items to the queue
q.push({name: 'foo'}, 10, function (err) {
  console.log('finished processing foo', err)
})
q.push({name: 'bar'}, 2, function (err) {
  console.log('finished processing bar', err)
})

// add some items to the queue (batch-wise)
q.push([{name: 'baz'}, {name: 'bay'}, {name: 'bax'}], 6, function (err) {
  console.log('finished processing item', err)
})
```

# Prior art
[async](https://github.com/caolan/async)
