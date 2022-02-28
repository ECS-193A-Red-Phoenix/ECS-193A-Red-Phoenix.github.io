class VectorField {
    constructor(u, v) {
        this.u = u;
        this.v = v;
        this.n_rows = u.length;
        this.n_cols = u[0].length;
        this.wet_cells = [];
        for (let j = 0; j < this.n_rows; j++) {
            for (let i = 0; i < this.n_cols; i++) {
                if (!(typeof this.u[j][i] === 'number' && typeof this.v[j][i] === 'number'))
                    continue;
                this.wet_cells.push([i, j]);
            }
        }
    }

    randomPoint() {
        let [i, j] = this.wet_cells[Math.floor(Math.random() * this.wet_cells.length)];
        return [i + Math.random(), j + Math.random()];
    }

    static bilinear(x, y, grid) {
        let n_rows = grid.length;
        let n_cols = grid[0].length;
        let i = Math.floor(x);
        let j = Math.floor(y);
        let if_undefined = (x, my_default) => (x === undefined) ? my_default : x;
        let get_grid = (j, i) => (i >= 0 && i < n_cols && j >= 0 && j < n_rows && typeof grid[j][i] === 'number') ? grid[j][i] : undefined;
        let f00 = if_undefined(get_grid(j, i), 0);
        let f10 = if_undefined(get_grid(j, i + 1), f00);
        let f01 = if_undefined(get_grid(j + 1, i), f00);
        let f11 = if_undefined(get_grid(j + 1, i + 1), f00);
        x -= i;
        y -= j;
        return f00 + (f10 - f00) * x + (f01 - f00) * y + (f11 - f10 - f01 + f00) * x * y;
    }

    outOfBounds(i, j) {
        return i < 0 || i >= this.n_cols || j < 0 || j >= this.n_rows || 
            this.u[j][i] === "nan" || this.v[j][i] === "nan" || 
            this.u[j][i] === undefined || this.v[j][i] === undefined;
    }

    getFlow(x, y) {
        return [VectorField.bilinear(x, y, this.u), VectorField.bilinear(x, y, this.v)];
    }

    drawWetCells(cx, x_s, y_s, width, height) {
        if (height === undefined)
            height = width;

        const black = 50;
        cx.fillStyle = `rgba(${black}, ${black}, ${black}, 1)`;
        for (let k = 0; k < this.wet_cells.length; k++) {
            let [i, j] = this.wet_cells[k];
            let x = x_s + i * width;
            let y = y_s + j * height;
            cx.fillRect(x, y, width + 1, height + 1);
        }
    }
}

class Particle {
    constructor(x, y, age, field) {
        this.xy_history = [[x, y]];
        this.age = age;
        this.field = field;
    }

    static newRandom(field) {
        const p = new Particle(0, 0, 0, field);
        p.resetRandom();
        return p;
    }

    resetRandom() {
        this.xy_history = [this.field.randomPoint()];
        this.age = Math.floor(Math.random() * (this.max_age - 10));
    }

    needsReset() {
        let [i, j] = this.xy_history[this.xy_history.length - 1];
        i = Math.floor(i);
        j = Math.floor(j);
        return this.age > this.max_age || this.field.outOfBounds(i, j);
    }

    getFlow() {
        let [x, y] = this.xy_history[this.xy_history.length - 1];
        return this.field.getFlow(x, y);
    }
    
    draw(context, x_s, y_s, width, height) {
        if (height === undefined)
            height = width;

        context.strokeStyle = "rgba(255, 255, 255, 0.4)";

        let x = (i) => x_s + i * width;
        let y = (j) => y_s + j * height;

        let [i, j] = this.xy_history[this.xy_history.length - 1];
        context.beginPath();
        context.moveTo(x(i), y(j));
        

        let start_idx = this.xy_history.length - 2;
        let end_idx = this.xy_history.length - 1 - this.max_history;
        end_idx = Math.max(0, end_idx);

        for (let k = start_idx; k > end_idx; k--) {
            [i, j] = this.xy_history[k];
            context.lineTo(x(i), y(j));
        }
        context.stroke();
    }
    
    move() {
        if (this.needsReset())
            this.resetRandom();
        let [u, v] = this.getFlow();
        let [i, j] = this.xy_history[this.xy_history.length - 1];
        this.xy_history.push([i + u * this.speed_scale, j + v * this.speed_scale]);
        this.age += 1;
    }
}
Particle.prototype.max_age = 50;
Particle.prototype.max_history = 8;
Particle.prototype.speed_scale = 1;

export { Particle, VectorField };