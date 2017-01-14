// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
module.exports = class DLL {

  constructor () {
    this.empty()
  }

  setInitial (node) {
    this.length = 1
    this.head = this.tail = node
  }

  empty () {
    this.head = null
    this.tail = null
    this.length = 0
  }

  removeLinks (fn) {
    if (typeof fn !== 'function') {
      return false
    }

    let node = this.head
    while (node) {
      let next = node.next
      if (fn(node)) {
        this.removeLink(node)
      }
      node = next
    }
  }

  removeLink (node) {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
    node.prev = node.next = null
    this.length -= 1

    return node
  }

  insertAfter (node, newNode) {
    newNode.prev = node
    newNode.next = node.next
    if (node.next) {
      node.next.prev = newNode
    } else {
      this.tail = newNode
    }
    node.next = newNode
    this.length += 1
  }

  insertBefore (node, newNode) {
    newNode.prev = node.prev
    newNode.next = node
    if (node.prev) {
      node.prev.next = newNode
    } else {
      this.head = newNode
    }
    node.prev = newNode
    this.length += 1
  }

  unshift (node) {
    if (this.head) {
      this.insertBefore(this.head, node)
    } else {
      this.setInitial(node)
    }
  }

  push (node) {
    if (this.tail) {
      this.insertAfter(this.tail, node)
    } else {
      this.setInitial(node)
    }
  }

  shift () {
    return this.head && this.removeLink(this.head)
  }

  pop () {
    return this.tail && this.removeLink(this.tail)
  }
}
