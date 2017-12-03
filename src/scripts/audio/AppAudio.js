import Tone from 'tone';

export default class AppAudio {

	constructor() {
		// const synth = new Tone.Synth().toMaster();

		//play a middle 'C' for the duration of an 8th note
		// synth.triggerAttackRelease("C4", "8n");

		this.synth = new Tone.PolySynth(6, Tone.SimpleSynth, {
			oscillator : {
				partials : [3, 2, 1, 0],
				volume : -10,
				// type: 'sine',
			},

			envelope : {
				attack : 0.01,
				decay: 0.5,
				sustain: 0.4,
				release: 1.8,
			}
		} ).toMaster();
	}

	keyToFreq(p) { 
		return Math.pow( 2, ( p ) / 12 ) * 61.74; // 1 -> C2
	}

	playNote(note) {
		// this.synth.triggerAttack(note);
		// const Gmajor = ['G3', 'B3', 'D4'];
		// note = Gmajor[floor(random(Gmajor.length))];
		// const notes = [48, 55, 60, 63, 67, 72];
		// const notes = [3, 2, 24];
		// const notes = [17, 10, 12, 8, 5, 17, 12, 17];
		// const notes = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'];
		// const notes = ['A3', 'C4', 'G4'];
		// note = this.keyToFreq(notes[floor(random(notes.length))]);

		// const index = (this.lastNote) ? this.lastNote : 0;
		// note = notes[index];
		// this.lastNote = (this.lastNote < notes.length - 1) ? this.lastNote + 1 : 0;
		this.synth.triggerAttackRelease(note, '32n');
	}

	stopNote(note) {
		// this.synth.triggerRelease(note);
	}
}
