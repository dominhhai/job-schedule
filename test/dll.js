const DLL = require('../DoublyLinkedList')

let dll = new DLL()

for (var i = 0; i < 100; i++) {
  dll.push({ data: i })
}
console.log(dll.length)
dll.removeLinks(node => node.data % 2 == 0)
console.log(dll.length)
