class NeuralNetwork {
	layers = [];
	learningRate = .5;

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
		return this.layers[this.layers.length - 1].calcActivation();
	}

	calcGradient(_input, _targetOutput) {
		let output = this.calcOutput(_input);
		let curDActivationError = output.copy().add(_targetOutput.copy().scale(-1)).scale(2); // Differential of the error

		let layerChanges = [];
		for (let l = this.layers.length - 1; l > 0; l--)
		{
			let curLayer = this.layers[l];
			let nextLayer = this.layers[l - 1];

			let dSigmoid = curLayer.z.copy().applyFunction(_sigmoid);
			let nextLayerDZError = curDActivationError.copy().elementWiseMultiply(dSigmoid);

			let nextLayerDActivationError = this.layers[l].weights.copy().transpose().multiply(nextLayerDZError);

			let layer = curLayer.copyShape();
			layer.biases = nextLayerDZError.copy();
			layer.weights = nextLayerDZError.copy().multiply(nextLayer.activation.copy().transpose());

			curDActivationError = nextLayerDActivationError;
			layerChanges[l] = layer;
		}

		return layerChanges;
	}

	trainSet(_dataPoints) {
		if (!_dataPoints.length) return;

		let summedChanges = this.calcGradient(_dataPoints[0].inputs, _dataPoints[0].outputs);

		for (let p = 1; p < _dataPoints.length; p++)
		{
			let gradient = this.calcGradient(_dataPoints[p].inputs, _dataPoints[p].outputs);

			for (let l = 1; l < gradient.length; l++)
			{
				summedChanges[l].weights.add(gradient[l].weights);
				summedChanges[l].biases.add(gradient[l].biases);
			}
		}

		const changeScalar = -this.learningRate / _dataPoints.length;
		for (let l = 1; l < summedChanges.length; l++)
		{
			summedChanges[l].weights.scale(changeScalar);
			summedChanges[l].biases.scale(changeScalar);
		}

		this.applyChanges(summedChanges);
	}


	calcSetError(_dataPoints) {
		let summedError = 0;

		for (let point of _dataPoints)
		{
			summedError += this.calcTotalError(point.inputs, point.outputs);
		}
		return summedError / _dataPoints.length;
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

	z;
	activation;

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
				this.weights.value[y][x] = random() * 2 - 1;
			}
		}
		for (let y = 0; y < this.biases.height; y++)
		{
			this.biases.value[y][0] = random() * 2 - 1;
		}
	}


	calcZ() {
		this.z = this.weights.copy().multiply(this.#prevLayer.calcActivation()).add(this.biases);
		return this.z;
	}
	calcActivation() {
		this.activation = this.calcZ().copy().applyFunction(sigmoid);
		return this.activation;
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
	calcActivation() {
		return this.activation;
	}
}










function sigmoid(x) { return 1 / (1 + Math.exp(-x)) } // f(x) = 1 / (1 + e^(-x))
function _sigmoid(x) { return sigmoid(x) * (1 - sigmoid(x)) } // f'(x) = f(x) * (1 - f(x))


function psora(k, n) {
  var r = Math.PI * (k ^ n)
  return r - Math.floor(r)
}

let numbers = 0;
const max = 100000000;
function random() {
	numbers++;
	return psora(numbers, max);
}