// Adapted from https://github.com/emoller/webgl-perf
const screenQuad = (gl, num) => {
	const vertexPosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
	let vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
	for (let i = 1; i < num; ++i) {
		vertices = vertices.concat([-1, -1, 1, -1, -1, 1, 1, 1]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	vertexPosBuffer.itemSize = 2;
	vertexPosBuffer.numItems = vertices.length / vertexPosBuffer.itemSize;
	return vertexPosBuffer;
};

const createShader = (gl, str, type) => {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw gl.getShaderInfoLog(shader);
	}
	return shader;
};

const createProgram = (gl, vstr, fstr) => {
	const program = gl.createProgram();
	const vshader = createShader(gl, vstr, gl.VERTEX_SHADER);
	const fshader = createShader(gl, fstr, gl.FRAGMENT_SHADER);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw gl.getProgramInfoLog(program);
	}
	return program;
};

const runPerformanceTest = (threshold = 9999, debug = false) => {
	const vs = `
		attribute vec2 aVertexPosition;
		void main() {
			gl_Position = vec4(aVertexPosition, 0, 1);
		}
	`;
	const fs = `
		precision mediump float;
		precision mediump int;
		uniform vec2 uSize;
		vec4 calc(vec2 texCoord) {
			float x = 0.0;
			float y = 0.0;
			float v = 10000.0;
			float j = 10000.0;
			for (int iteration = 0; iteration < 1; ++iteration) {
				float xtemp = x*x-y*y+texCoord.x;
				y = 2.0*x*y+texCoord.y;
				x = xtemp;
				v = min(v, abs(x*x+y*y));
				j = min(j, abs(x*y));
				if (x*x+y*y >= 8.0) {
					float d = (float(iteration) - (log(log(sqrt(x*x+y*y))) / log(2.0))) / 50.0;
					v = (1.0 - v) / 2.0;
					j = (1.0 - j) / 2.0;
					return vec4(d,d+v,d+j,1);
				}
			}
			return vec4(0,0,0,1);
		}
		void main() {
			vec2 texCoord = (gl_FragCoord.xy / uSize.xy) * 2.0 - vec2(1.0,1.0);
			gl_FragColor = calc(texCoord);
		}
	`;
	const c = document.createElement('canvas');
	const dpr = window.devicePixelRatio || 1;
	c.width = window.innerWidth * 0.5 * dpr;
	c.height = window.innerHeight * 0.5 * dpr;
	const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	const vertexPosBuffer = screenQuad(gl, 100);
	const program = createProgram(gl, vs, fs);
	gl.useProgram(program);
	program.vertexPosAttrib = gl.getAttribLocation(program, 'aVertexPosition');
	program.sizeUniform = gl.getUniformLocation(program, 'uSize');
	gl.enableVertexAttribArray(program.vertexPosArray);
	gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.uniform2f(program.sizeUniform, c.width, c.height);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);
	const arr = new Uint8Array(4);

	const timeStart = new Date().getTime();
	const iterations = 5;
	let elapsed = 0;
	let i = 0;

	for (i = 0; i < iterations; ++i) {
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
		gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, arr);
		
		elapsed = new Date().getTime() - timeStart;
		if (elapsed > threshold) break;
	}

	// gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, arr);

	if (debug) {
		const id = 'webgl-perf';
		const div = document.getElementById(id) || document.createElement('div');
		div.id = id;
		div.style.fontFamily = 'sans-serif';
		div.style.fontSize = '10px';
		div.style.color = 'white';
		div.style.position = 'absolute';
		div.style.top = '0px';
		div.style.left = (document.getElementById('app')) ? '204px' : '0px';
		div.style.padding = '5px';
		div.style.backgroundColor = 'rgba(120, 50, 120, 0.8)';

		div.innerText = `WebGL Perf: threshold: ${threshold} / iterations: ${i} of ${iterations} / result: ${elapsed}`;
		document.getElementsByTagName('body')[0].appendChild(div);
	}

	return elapsed;
};

export { runPerformanceTest };
