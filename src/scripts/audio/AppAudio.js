import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';
import * as MidiConvert from 'midiconvert';

import AppState from './../state/AppState';

export default class AppAudio {

	constructor() {
		this.initSynth();
		this.initSongs();
		// this.initPart();
		// this.initMidi();

		this.lastNote = 0;

		StartAudioContext(Tone.context, document.querySelector('canvas'));

		AppState.on('state:change', this.onStateChange.bind(this));
	}

	initSynth() {
		this.synth = new Tone.PolySynth(4, Tone.Synth, {
			oscillator : {
				// partials : [3, 2, 1, 0],
				partials : [0, 2, 3, 4],
				// volume : -10,
				type: 'triangle',
			},

			envelope : {
				attack : 0.01,
				decay: 0.5,
				sustain: 0.4,
				release: 1.8,
			}
		} ).toMaster();
		

		// this.synth = new Tone.Players({
		this.percussion = new Tone.Sampler({
			'G#3' 	: 'audio/Gs4.mp3',
			'C4' 	: 'audio/C5.mp3',
			'C#4' 	: 'audio/Cs5.mp3',
			'D#4' 	: 'audio/Ds5.mp3',
			'E4' 	: 'audio/E5.mp3',
			'E5' 	: 'audio/E6.mp3',
			'F5' 	: 'audio/F6.mp3',
		}, {
			//
		}).toMaster();

		
	}

	initMidi() {
		MidiConvert.load('audio/1512777028056.mid', (midi) => {
			Tone.Transport.bpm.value = midi.header.bpm;

			// sorry mom
			const triangle = app.view.webgl.triangle;

			const offset = 0;

			new Tone.Part((time, note) => {
				this.percussion.triggerAttackRelease(note.name, note.duration, time, note.velocity);
				triangle.noteOn(note, true);
			}, midi.tracks[3].notes).start(0, offset);

			new Tone.Part((time, note) => {
				// note.name = this.bumpOctave(note.name);
				this.synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
				triangle.noteOn(note);
			}, midi.tracks[1].notes).start(0, offset);

			// start the transport to hear the events
			Tone.Transport.start();
		});
		
	}

	initSongs() {
		this.songs = [];

		// jingle bells
		this.songs.push([
			'B3', 'B3', 'B3', 'B3', 'B3', 'B3',
			'B3', 'D4', 'G3', 'A3', 'B3',
			'C4', 'C4', 'C4', 'C4', 'C4', 'B3', 'B3',
			'B3', 'B3', 'A3', 'A3', 'B3', 'A3', 'D4',
		]);

		// so this is christmas
		this.songs.push([
			'A3', 'A3', 'B3', 'C#4', 'A3', 'E3',
			'E3', 'A3', 'B3', 'C#4', 'B3',
			'F3', 'C#4', 'D#4', 'E4', 'D#4', 'C#4',
			'E3', 'C#4', 'E4', 'C#4', 'B3', 'A3',

			'A3', 'F#4', 'F#4', 'F#4', 'E4', 'D4',
			'A3', 'D4', 'E4', 'F#4', 'E4',
			'B3', 'E4', 'F#4', 'G4', 'F#4', 'E4',
			'A3', 'F#4', 'A4', 'F#4', 'E4', 'D4',
		]);

		// we wish you a merry christmas
		this.songs.push([
			'G3', 'C4', 'C4', 'D4', 'C4', 'B3', 'A3', 'F3',
			'A3', 'D4', 'D4', 'E4', 'D4', 'C4', 'B3', 'G3',
			'B3', 'E4', 'E4', 'F4', 'E4', 'D4', 'C4', 'A3',
			'G3', 'G3', 'A3', 'D4', 'B3', 'C4',
		]);
	}

	keyToFreq(p) { 
		return Math.pow( 2, ( p ) / 12 ) * 61.74; // 1 -> C2
	}

	playNote(note) {
		note = this.song[this.lastNote];
		if (!note) return;
		this.lastNote = (this.lastNote < this.song.length - 1) ? this.lastNote + 1 : 0;
		this.synth.triggerAttackRelease(note, '32n');
	}

	stopNote(note) {
		// this.synth.triggerRelease(note);
	}

	bumpOctave(noteName) {
		const octave = parseInt(noteName.substr(noteName.length - 1));
		return `${noteName.substr(0, noteName.length - 1)}${octave + 1}`;
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	onStateChange(e) {
		let oscillatorType = 'triangle';
		let envelopeAttack = 0.01;

		switch (e.state.index) {
			default:
			case 0: {
				this.song = this.songs[0];
				break;
			}
			case 1: {
				this.song = this.songs[1];
				oscillatorType = 'amsine';
				break;
			}
			case 2: {
				this.song = this.songs[2];
				oscillatorType = 'amtriangle';
				break;
			}
			case 'knm': {
				this.song = [];
				this.initMidi();
				envelopeAttack = 0.1;
				break;
			}
		}

		for (let i = 0; i < this.synth.voices.length; i++) {
			this.synth.voices[i].oscillator.type = oscillatorType;
			this.synth.voices[i].envelope.attack = envelopeAttack;
		}

		this.lastNote = 0;
	}
}
