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

		this.lastNote = 0;
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

		// jingle bells
		// const notes = [
			// 'B3', 'B3', 'B3', 'B3', 'B3', 'B3', 'D4', 'G3', 'A3', 'B3',
			// 'C4', 'C4', 'C4', 'C4', 'C4', 'B3', 'B3', 'B3', 'B3', 'B3', 'A3', 'A3', 'B3', 'A3', 'D4',
		// ];

		// so this is christmas
		const notes = [
			'A3','A3', 'B3', 'C#4', 'A3', 'E3',
			'E3', 'A3', 'B3', 'C#4', 'B3',
			'F3', 'C#4', 'D#4', 'E4', 'D#4', 'C#4',
			'E3', 'C#4', 'E4', 'C#4', 'B3', 'A3',

			'A3', 'F#4', 'F#4', 'F#4', 'E4', 'D4',
			'A3', 'D4', 'E4', 'F#4', 'E4',
			'B3', 'E4', 'F#4', 'G4', 'F#4', 'E4',
			'A3', 'F#4', 'A4', 'F#4', 'E4', 'D4',
		];


		// note = this.keyToFreq(notes[floor(random(notes.length))]);

		note = notes[this.lastNote];
		this.lastNote = (this.lastNote < notes.length - 1) ? this.lastNote + 1 : 0;
		this.synth.triggerAttackRelease(note, '32n');
	}

	stopNote(note) {
		// this.synth.triggerRelease(note);
	}
}
