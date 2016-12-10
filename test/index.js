const Queue = require('../index')

var timerId = null
var q = new Queue((task, cb) => {
  console.log('priority:hello', task.name)
  cb()
}, 1)

q.when = function (node, cb) {
  if (node.priority -- < 2) {
    clearTimeout(timerId)
    console.log('start:', node.data.name)
    return true
  }
  timerId = setTimeout(cb, 300)
}

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
