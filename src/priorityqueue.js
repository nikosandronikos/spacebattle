"use strict";
/*
 * A very basic PriorityQueue implementation.
 * FIXME: Implement as a binary heap for speed.
 */

class PriorityQueue {
    // cmp_fn compares a to b and is like strcmp
    constructor(cmp_fn)
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

    clear()
    {
        this.data = [];
    }
}
