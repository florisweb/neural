

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










