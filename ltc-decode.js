class LTCNode extends AudioWorkletNode {
    constructor(context, onFrame) {
	super(context, 'ltc-processor');
	this.port.onmessage = (e) => onFrame(e.data);
    }
}

const audioElem = document.querySelector('audio');
const logElem = document.querySelector('#log');

audioContext = null;

function frameReceived(frame)
{
    logElem.innerHTML = frame.toString(16);
}

async function setupContext(context)
{
    let source = audioContext.createMediaElementSource(audioElem);
    
    await audioContext.audioWorklet.addModule('ltc-processor.js')
    const ltcNode = new LTCNode(audioContext, frameReceived)
    source.connect(ltcNode)
    
    audioElem.play()
    console.log("Audio setup");
}

function setupAudio()
{
    audioContext = new AudioContext()
    setupContext(audioContext);
}

console.log("Running");
