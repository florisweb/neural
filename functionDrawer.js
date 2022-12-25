
class FunctionDrawer {
	#canvas;
	#ctx;
	gridManager = new gridManager();
	points = [];
	#xDomain = new Vector(0, 1);
	#yDomain = new Vector(0, 1);



	constructor(_canvas) {
		this.#canvas = _canvas;
		this.#ctx = this.#canvas.getContext('2d');
	}

	setDomain(_xDomain, _yDomain) {
		this.#xDomain = _xDomain;
		this.#yDomain = _yDomain;
	}



	drawFunction(_f) {	
		this.points = [];
		this.gridManager = new gridManager();

		const delta = (this.#xDomain.value[1] - this.#xDomain.value[0]) / 30;
		for (let x = this.#xDomain.value[0]; x < this.#xDomain.value[1]; x += delta)
		{
			for (let y = this.#yDomain.value[0]; y < this.#yDomain.value[1]; y += delta)
			{
				(new PointerPoint(new Vector(x, y))).setup(this);
				
			}	
		}
	
		for (let i = 0; i < 5; i++) this.#devidePoints();
		this.#draw(1);
	}


	#devidePoints() {
		let newPoints = [];
		for (let point of this.points) newPoints = newPoints.concat(point.devide(this));
		for (let point of newPoints) point.setup(this);
	}

	#draw(_minDepth = 0) {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		for (let point of this.points) 
		{
			if (point.depth < _minDepth) continue;
			point.draw(this);
		}
	}



	drawPoint(_pos, _color = '#f00') {
		let pxPos = this.posToPx(_pos);
		this.#ctx.fillStyle = _color;
		const size = 2;
		this.#ctx.fillRect(
			pxPos.value[0] - size / 2,
			pxPos.value[1] - size / 2,
			size,
			size
		);
	}


	posToPx(_pos) {
		return new Vector(
			(_pos.value[0] - this.#xDomain.value[0]) / (this.#xDomain.value[1] - this.#xDomain.value[0]) * this.#canvas.width,
			(_pos.value[1] - this.#yDomain.value[0]) / (this.#yDomain.value[1] - this.#yDomain.value[0]) * this.#canvas.height
		);
	}

	pxToPos(_pxPos) {
		return new Vector(
			_pxPos.value[0] / this.#canvas.width * (this.#xDomain.value[1] - this.#xDomain.value[0]) + this.#xDomain.value[0], 
			_pxPos.value[1] / this.#canvas.height * (this.#yDomain.value[1] - this.#yDomain.value[0]) + this.#yDomain.value[0]
		);
	}
}




class PointerPoint {
	pos;
	depth;
	get aboveLine() {
		return f(this.pos.value[0], this.pos.value[1]);
	}

	constructor(_pos, _depth = 0) {
		this.pos = _pos;
		this.depth = _depth;
	}

	setup(_FD) {
		_FD.gridManager.addPoint(this);
		_FD.points.push(this);
	}


	draw(_DF) {
		_DF.drawPoint(this.pos, this.aboveLine ? '#f00' : '#00f');
	}


	devide(_DF) {
		let newPoints = [];
		if (this.aboveLine) return []; // only the one under the line duplicates
		
		let neighbours = [..._DF.gridManager.getDirectXNeighbours(this), ..._DF.gridManager.getDirectYNeighbours(this)];
		for (let neighbour of neighbours)
		{
			if (neighbour.aboveLine === this.aboveLine) continue;
			let newPos = neighbour.pos.copy().add(this.pos).scale(.5);
			let newPoint = new PointerPoint(newPos, Math.max(this.depth, neighbour.depth) + 1);
			newPoints.push(newPoint);
		}
		return newPoints;
	}
}




class gridManager {
	rowList = []; // horizontal -> holds all the points with the same y-value
	columnList = []; // vertical

	addPoint(_point) {
		let x = _point.pos.value[0];
		let y = _point.pos.value[1];

		if (!this.columnList[x]) this.columnList[x] = [];
		this.columnList[x].push(_point);
		this.columnList[x].sort((a, b) => a.pos.value[1] > b.pos.value[1]);

		if (!this.rowList[y]) this.rowList[y] = [];
		this.rowList[y].push(_point);
		this.rowList[y].sort((a, b) => a.pos.value[0] > b.pos.value[0]);
	}

	getDirectXNeighbours(_point) {
		let y = _point.pos.value[1];
		let neighbours = this.rowList[y];
		let ownIndex = neighbours.indexOf(_point);
		let directNeighbours = [];
		if (ownIndex - 1 >= 0) directNeighbours.push(neighbours[ownIndex - 1]);
		if (neighbours.length > ownIndex + 1) directNeighbours.push(neighbours[ownIndex + 1]);
		return directNeighbours;
	}

	getDirectYNeighbours(_point) {
		let x = _point.pos.value[0];
		let neighbours = this.columnList[x];
		let ownIndex = neighbours.indexOf(_point);
		let directNeighbours = [];
		if (ownIndex - 1 >= 0) directNeighbours.push(neighbours[ownIndex - 1]);
		if (neighbours.length > ownIndex + 1) directNeighbours.push(neighbours[ownIndex + 1]);
		return directNeighbours;
	}

}
