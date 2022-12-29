class NeuralNetwork {
	layers = [];

	constructor(_layers = [2, 3, 1]) {
		let prevLayer;
		for (let layerHeight of _layers)
		{
			let constructor = Layer;
			if (!prevLayer) constructor = InputLayer;
			let layer = new constructor(layerHeight, prevLayer);
			prevLayer = layer;
			layer.randomizeParameters();
			this.layers.push(layer);
		}
	}

	calcOutput(_input) {
		this.layers[0].setActivation(_input);
		return this.layers[this.layers.length - 1].activation;
	}

	calcChanges(_input, _targetOutput) {
		const learningRate = .1;

		let output = this.calcOutput(_input);
		let errors = output.copy().add(_targetOutput.copy().scale(-1)).applyFunction((v) => v**2);
		let dError = output.copy().add(_targetOutput.copy().scale(-1)).scale(2);
		let totalError = errors.value.map(r => r[0]).reduce((sum, val) => sum += val);


		let curDActivationError = dError.copy();
		let layerChanges = [];
		for (let l = this.layers.length - 1; l > 0; l--)
		{
			let curLayer = this.layers[l];
			let nextLayer = this.layers[l - 1];
			// let nextLayerDActivationError = this.layers[l].weights.copy().transpose().multiply(curDActivationError);

			let dSigmoid = curLayer.z.copy().applyFunction(_sigmoid);
			let nextLayerDZError = curDActivationError.copy().elementWiseMultiply(dSigmoid);

			let nextLayerDActivationError = this.layers[l].weights.copy().transpose().multiply(nextLayerDZError);

			let layer = curLayer.copyShape();
			layer.biases = nextLayerDZError.copy().scale(-learningRate);
			layer.weights = nextLayerDZError.copy().multiply(nextLayer.activation.copy().transpose()).scale(-learningRate);


			// let layer = curLayer.copyShape();
			// layer.biases = curDActivationError.copy().scale(-learningRate);
			// layer.weights = curDActivationError.copy().multiply(nextLayer.activation.copy().transpose()).scale(-learningRate);

			curDActivationError = nextLayerDActivationError;
			layerChanges[l] = layer;
		}

		return {
			changes: layerChanges,
			error: totalError
		}
	}
	calcTotalError(_input, _targetOutput) {
		let output = this.calcOutput(_input);
		let errors = output.copy().add(_targetOutput.copy().scale(-1)).applyFunction((v) => v**2);
		return errors.value.map(r => r[0]).reduce((sum, val) => sum += val);
	}


	applyChanges(_layerChanges) {
		for (let l = 1; l < _layerChanges.length; l++)
		{
			this.layers[l].biases.add(_layerChanges[l].biases);
			this.layers[l].weights.add(_layerChanges[l].weights);
		}
	}
}




class Layer {
	#prevLayer;

	biases;
	weights; // Weights from the previous to this layer
	get size() {return this.biases.height}

	constructor(_size, _prevLayer) {
		this.#prevLayer = _prevLayer;
		this.biases = new Matrix(1, _size, 0);
		if (!_prevLayer) return;
		this.weights = new Matrix(_prevLayer.size, _size, 0)
	}
	
	randomizeParameters() {
		if (!this.weights || !this.biases) return;
		for (let y = 0; y < this.weights.height; y++)
		{
			for (let x = 0; x < this.weights.width; x++)
			{
				this.weights.value[y][x] = Math.random() * 2 - 1;
			}
		}
		for (let y = 0; y < this.biases.height; y++)
		{
			this.biases.value[y][0] = Math.random() * 2 - 1;
		}
	}

	get z() {
		return this.weights.copy().multiply(this.#prevLayer.activation).add(this.biases);
	}
	get activation() {
		return this.z.applyFunction(sigmoid);
	}

	copyShape() {
		return new Layer(this.size, this.#prevLayer);
	}
}

class InputLayer extends Layer {
	activation;
	constructor(_size) {
		super(_size, false);
		this.activation = new Matrix(1, _size);
	}

	setActivation(_input) {
		if (_input.width !== 1 || _input.height !== this.size) return console.warn('Invalid input size');
		this.activation = _input;
	}
}










function sigmoid(x) { return 1 / (1 + Math.exp(-x)) } // f(x) = 1 / (1 + e^(-x))
function _sigmoid(x) { return sigmoid(x) * (1 - sigmoid(x)) } // f'(x) = f(x) * (1 - f(x))