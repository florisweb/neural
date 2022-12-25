

class Perceptron {
	bias = Math.random();
	weight = Math.random();

	calcActivation(_input) {
		return this.bias + this.weight * _input;
	}


	calcChanges(_input, _targetOutput) {
		let activation = this.calcActivation(_input);
		let error = (activation - _targetOutput)**2;

		let dE = 2 * (activation - _targetOutput);
		let dW = dE * _input;
		let dB = dE;
		return {
			error: error,
			dW: dW,
			dB: dB,
		}
	}

}