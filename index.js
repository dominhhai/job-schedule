const DLL = require('./DoublyLinkedList')

const noop = function () { return true }

module.exports = class Queue {

  constructor (worker, concurrency = 1) {
    this.worker = worker
    this.concurrency = concurrency
    this._tasks = new DLL()
    this.when = noop
    this.saturated = noop
    this.unsaturated = noop
    this.buffer = concurrency / 4
    this.empty = noop
    this.drain = noop
    this.error = noop
    this.started = false
    this.paused = false
    this.workers = 0
    this.workersList = []
    this.isProcessing = false
  }

  push (tasks, priority, callback) {
    if (!callback) callback = noop
    if (typeof callback !== 'function') {
      throw new Error('task callback must be a function')
    }
    this.started = true
    if (!Array.isArray(tasks)) {
      tasks = [tasks]
    }
    if (tasks.length === 0) {
      // call drain immediately if there are no tasks
      return setImmediate(() => this.drain())
    }

    priority = priority || 0
    let nextNode = this._tasks.head
    while (nextNode && priority >= nextNode.priority) {
      nextNode = nextNode.next
    }

    for (let data of tasks) {
      let item = {
        data,
        priority,
        callback
      }
      if (nextNode) {
        this._tasks.insertBefore(nextNode, item)
      } else {
        this._tasks.push(item)
      }
    }

    setImmediate(() => this.process())
  }

  kill () {
    this.drain = noop
    this._tasks.empty()
  }

  remove (fn) {
    return this._tasks.removeLink(fn)
  }

  length () {
    return this._tasks.length
  }

  running () {
    return this.workers
  }

  workersList () {
    return this.workersList
  }

  idle () {
    return this._tasks.length + this.workers === 0
  }

  pause () {
    this.paused = true
  }

  resume () {
    if (this.paused) {
      this.paused = false
      setImmediate(() => this.process())
    }
  }

  process () {
    if (this.isProcessing) {
      return
    }
    this.isProcessing = true
    while (!this.paused && this.workers < this.concurrency && this._tasks.length) {
      if (!this.when(this._tasks.head, () => setImmediate(() => this.process()))) {
        break
      }
      var node = this._tasks.shift()

      if (this._tasks.length === 0) {
        this.empty()
      }
      this.workers++
      this.workersList.push(node)

      if (this.workers === this.concurrency) {
        this.saturated()
      }

      this.worker(node.data, this.next(node))
    }
    this.isProcessing = false
  }

  next (node) {
    return (...args) => {
      this.workers--

      var index = this.workersList.indexOf(node)
      if (index >= 0) {
        this.workersList.splice(index)
      }

      node.callback(...args)

      if (args[0] != null) {
        this.error(args[0], node.data)
      }

      if (this.workers <= (this.concurrency - this.buffer)) {
        this.unsaturated()
      }

      if (this.idle()) {
        this.drain()
      }
      setImmediate(() => this.process())
    }
  }
}
