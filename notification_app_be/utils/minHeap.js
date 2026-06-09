/**
 * A Min-Heap of fixed size capacity.
 * Used for maintaining the Top K highest-priority notifications.
 * The root of this heap represents the MINIMUM priority score among the current Top K.
 */
class MinHeap {
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.heap = [];
  }

  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  swap(i1, i2) {
    const temp = this.heap[i1];
    this.heap[i1] = this.heap[i2];
    this.heap[i2] = temp;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  size() {
    return this.heap.length;
  }

  /**
   * Pushes a new item into the heap.
   * If heap exceeds capacity, the element with the minimum priority score is ejected.
   * Time Complexity: O(log K) where K is capacity
   * @param {Object} item - notification item containing calculatedPriorityScore
   */
  push(item) {
    // If heap is not full, add it and heapify up
    if (this.heap.length < this.capacity) {
      this.heap.push(item);
      this.heapifyUp(this.heap.length - 1);
      return true;
    }

    // If heap is full, compare with minimum (root)
    const root = this.peek();
    if (item.calculatedPriorityScore > root.calculatedPriorityScore) {
      // Replace root and heapify down
      this.heap[0] = item;
      this.heapifyDown(0);
      return true;
    }

    // If new item's score is less or equal to the min of top K, ignore it
    return false;
  }

  heapifyUp(index) {
    let current = index;
    let parent = this.getParentIndex(current);

    while (
      current > 0 &&
      this.heap[current].calculatedPriorityScore < this.heap[parent].calculatedPriorityScore
    ) {
      this.swap(current, parent);
      current = parent;
      parent = this.getParentIndex(current);
    }
  }

  heapifyDown(index) {
    let current = index;
    const length = this.heap.length;

    while (true) {
      let left = this.getLeftChildIndex(current);
      let right = this.getRightChildIndex(current);
      let smallest = current;

      if (
        left < length &&
        this.heap[left].calculatedPriorityScore < this.heap[smallest].calculatedPriorityScore
      ) {
        smallest = left;
      }

      if (
        right < length &&
        this.heap[right].calculatedPriorityScore < this.heap[smallest].calculatedPriorityScore
      ) {
        smallest = right;
      }

      if (smallest !== current) {
        this.swap(current, smallest);
        current = smallest;
      } else {
        break;
      }
    }
  }

  /**
   * Extracts the minimum element (root) from the heap.
   * Time Complexity: O(log K)
   */
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }

  /**
   * Returns the top K notifications sorted in descending order.
   * Since this empties the heap to get the ordered array, we work on a copy.
   * Time Complexity: O(K log K) where K = 10
   */
  toArraySorted() {
    const heapCopy = new MinHeap(this.capacity);
    heapCopy.heap = [...this.heap];
    
    const sorted = [];
    while (heapCopy.size() > 0) {
      sorted.push(heapCopy.extractMin());
    }
    
    // Since we extracted minimums, we reverse it to get descending order (highest score first)
    return sorted.reverse();
  }
}

module.exports = MinHeap;
