"use strict";
/*
 * A very basic PriorityQueue implementation.
 * FIXME: Implement as a binary heap for speed, once I work out the API
 * requirements.
 */

// Requires the following operations:
// * Add an element and have it be inserted in priority order
// * Pop the highest priority element off the queue
// * Remove any arbitrary element 
class PriorityQueue {
    // cmp_fn compares a to b and is like strcmp
    constructor(cmp_fn = (a,b) => a < b)
    {
        this.data = [];
        this.cmp_fn = cmp_fn;
    }   

    insert(object)
    {
        this.data.push(object);
        this.data.sort(this.cmp_fn);
    }   

    // returns undefined if empty
    pop()
    {
        return this.data.pop();
    }

    remove(object) {
        const i = this.data.indexOf(object);
        if (i == -1) return false;
        this.data.splice(i, 1);
        return true;
    }

    clear()
    {
        this.data = [];
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports.PriorityQueue = PriorityQueue;
}
