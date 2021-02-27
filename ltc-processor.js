
class LTCProcessor extends AudioWorkletProcessor {
    constructor() {
	super();
	this.interval = 0.0; // Accumulator for current interval in samples
	this.prev_sample = 0.0; // Value of previous sample
	this.half_bit = 10; // Length of half bit in samples
	this.prev_first_half = false;// Previuos interval was the first half bit
	this.sync = 1n; // Word used for finding sync
    }
    
    handle_interval()
    {
	if (this.interval < this.half_bit) this.half_bit *= 0.99;
	else if (this.interval > 2*this.half_bit) this.half_bit *= 1.01;
	if (this.interval < 1.5 * this.half_bit) {
	    if (this.prev_first_half) {
		this.sync = (this.sync >> 1n) | 0x80000000000000000000n;
		this.prev_first_half = false;
	    } else {
		this.prev_first_half = true;
	    }
	} else {
	    this.sync = this.sync >> 1n;
	    this.prev_first_half = false;
	}
	if (!this.prev_first_half 
	    && (this.sync &0xffff0000000000000000n ) == 0xbffc0000000000000000) {
	    this.port.postMessage(this.sync);
	}
    }
    
    process (inputs, outputs, parameters) {
	const output = outputs[0]
	const input_ch = inputs[0][0];
	for (let i=0;i < input_ch.length; i++) {
	    const s = input_ch[i];
	    if ((s >= 0.0 && this.last_sample < 0)
		|| (s <= 0.0 && this.last_sample > 0)) {
		const frac = this.last_sample / (this.last_sample - s);
		this.interval += frac;
		this.handle_interval();
		this.interval = 1 - frac;
	    } else {
		this.interval += 1.0;
	    }
	    
	    this.last_sample = s;
	}
	
	return true
    }
}

registerProcessor('ltc-processor', LTCProcessor)
