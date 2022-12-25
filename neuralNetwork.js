

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
		let totalError = errors.value.map(r => r[0]).reduce((sum, val) => sum += val);
		console.log(totalError);

		let curActivationError = errors.copy();
		let layerChanges = [];
		for (let l = this.layers.length - 1; l > 0; l--)
		{
			let nextLayerActivationError = this.layers[l].weights.copy().transpose().multiply(curActivationError);
			
			let layer = this.layers[l].copyShape();
			layer.biases = curActivationError.copy().scale(-learningRate);
			layer.weights = curActivationError.copy().multiply(nextLayerActivationError.copy().transpose());

			curActivationError = nextLayerActivationError;
			layerChanges[l] = layer;
		}

		return layerChanges;
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
		this.biases = new Matrix(1, _size, .2);
		if (!_prevLayer) return;
		this.weights = new Matrix(_prevLayer.size, _size, .3)
	}

	get activation() {
		return this.weights.copy().multiply(this.#prevLayer.activation).add(this.biases);
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










