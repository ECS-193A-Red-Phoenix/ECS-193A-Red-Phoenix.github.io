import { if_undefined } from "./util";

class Matrix {
    constructor(rows, cols) {
        this.m = [];
        this.rows = rows;
        this.cols = cols;
        for (let j = 0; j < rows; j++) {
            let row = [];
            for (let i = 0; i < cols; i++)
                row.push(0);
            this.m.push(row);
        }
    }
    
    get(row, col) {
        return this.m[row][col];
    }

    shape() {
        return [this.rows, this.cols];
    }

    static from1DArray(array) {
        let matrix = new Matrix(array.length, 1);
        for (let j = 0; j < array.length; j++)
            matrix.m[j][0] = array[j];
        return matrix
    }

    static from2DArray(array) {
        let [rows, cols] = [array.length, array[0].length];
        let matrix = new Matrix(rows, cols);
        for (let j = 0; j < rows; j++)
            for (let i = 0; i < cols; i++)
                matrix.m[j][i] = array[j][i];
        return matrix;
    }

    static multiply(m1, m2) {
        let [r1, c1] = m1.shape();
        let [r2, c2] = m2.shape();
        if (c1 != r2)
            throw new Error("Matrix.multiply(): matrices m1 and m2 do not have compatible dimensions");

        let res = new Matrix(r1, c2);
        for (let j = 0; j < r1; j++) {
            for (let i = 0; i < c2; i++) {
                for (let k = 0; k < c1; k++) {
                    res.m[j][i] += m1.m[j][k] * m2.m[k][i];
                }
            }
        }
        return res;
    }
}

// Bilinear Interpolation on a grid
// See https://en.wikipedia.org/wiki/Bilinear_interpolation
function bilinear(x, y, grid) {
    let n_rows = grid.length;
    let n_cols = grid[0].length;
    let i = Math.floor(x);
    let j = Math.floor(y);
    let get_grid = (j, i) => (i >= 0 && i < n_cols && j >= 0 && j < n_rows && typeof grid[j][i] === 'number') ? grid[j][i] : undefined;
    let f00 = if_undefined(get_grid(j, i), 0);
    let f10 = if_undefined(get_grid(j, i + 1), f00);
    let f01 = if_undefined(get_grid(j + 1, i), f00);
    let f11 = if_undefined(get_grid(j + 1, i + 1), f00);
    x -= i;
    y -= j;
    return f00 + (f10 - f00) * x + (f01 - f00) * y + (f11 - f10 - f01 + f00) * x * y;
}

// Bicubic Interpolation on a grid
// See https://en.wikipedia.org/wiki/Bicubic_interpolation
const bicubic_A = Matrix.from2DArray([
    [  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [ -3,  3,  0,  0, -2, -1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  2, -2,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0, -3,  3,  0,  0, -2, -1,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0,  2, -2,  0,  0,  1,  1,  0,  0 ],
    [ -3,  0,  3,  0,  0,  0,  0,  0, -2,  0, -1,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0, -3,  0,  3,  0,  0,  0,  0,  0, -2,  0, -1,  0 ],
    [  9, -9, -9,  9,  6,  3, -6, -3,  6, -6,  3, -3,  4,  2,  2,  1 ],
    [ -6,  6,  6, -6, -3, -3,  3,  3, -4,  4, -2,  2, -2, -2, -1, -1 ],
    [  2,  0, -2,  0,  0,  0,  0,  0,  1,  0,  1,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  2,  0, -2,  0,  0,  0,  0,  0,  1,  0,  1,  0 ],
    [ -6,  6,  6, -6, -4, -2,  4,  2, -3,  3, -3,  3, -2, -1, -2, -1 ],
    [  4, -4, -4,  4,  2,  2, -2, -2,  2, -2,  2, -2,  1,  1,  1,  1 ],
])

function bicubic(x, y, grid) {
    let n_rows = grid.length;
    let n_cols = grid[0].length;
    let i = Math.floor(x);
    let j = Math.floor(y);
    let get_grid = (j, i) => (i >= 0 && i < n_cols && j >= 0 && j < n_rows && typeof grid[j][i] === 'number') ? grid[j][i] : undefined;
    let f00 = if_undefined(get_grid(j, i), 0);
    let f10 = if_undefined(get_grid(j, i + 1), f00);
    let f01 = if_undefined(get_grid(j + 1, i), f00);
    let f11 = if_undefined(get_grid(j + 1, i + 1), f00);
    
    function derivative(i, j, dx, dy) {
        let prev = get_grid(j - dy, i - dx);
        let cur = if_undefined(get_grid(j, i), f00);
        let next = get_grid(j - dy, i + dx);
        if (prev === undefined && next === undefined)
            return 0;
        else if (prev === undefined && next !== undefined)
            prev = cur - (next - cur);
        else if (prev !== undefined && next === undefined)
            next = cur + (cur - prev);
        return (next - prev) / 2;
    }

    function derivative_xy(i, j) {
        let prev = derivative(i, j - 1, 0, 1);
        let next = derivative(i, j + 1, 0, 1);
        return (next - prev) / 2;
    }

    let fx00 = derivative(0, 0, 1, 0);
    let fx10 = derivative(1, 0, 1, 0);
    let fx01 = derivative(0, 1, 1, 0);
    let fx11 = derivative(1, 1, 1, 0);
    let fy00 = derivative(0, 0, 0, 1);
    let fy10 = derivative(1, 0, 0, 1);
    let fy01 = derivative(0, 1, 0, 1);
    let fy11 = derivative(1, 1, 0, 1);
    let fxy00 = derivative_xy(0, 0, 0, 1);
    let fxy10 = derivative_xy(1, 0, 0, 1);
    let fxy01 = derivative_xy(0, 1, 0, 1);
    let fxy11 = derivative_xy(1, 1, 0, 1);

    let f = Matrix.from1DArray([f00, f10, f01, f11, fx00, fx10, fx01, fx11, fy00, fy10, fy01, fy11, fxy00, fxy10, fxy01, fxy11]);
    let a = Matrix.multiply(bicubic_A, f);
    a = Matrix.from2DArray([
        [a.get(0, 0), a.get(4, 0), a.get( 8, 0), a.get(12, 0)],
        [a.get(1, 0), a.get(5, 0), a.get( 9, 0), a.get(13, 0)],
        [a.get(2, 0), a.get(6, 0), a.get(10, 0), a.get(14, 0)],
        [a.get(3, 0), a.get(7, 0), a.get(11, 0), a.get(15, 0)],
    ]);

    x -= i;
    y -= j;
    let x_vec = Matrix.from2DArray([[1, x, x**2, x**3]]);
    let y_vec = Matrix.from1DArray([1, y, y**2, y**3]);
    let res = Matrix.multiply(x_vec, Matrix.multiply(a, y_vec));
    return res.get(0, 0);
}





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

    outOfBounds(i, j) {
        return i < 0 || i >= this.n_cols || j < 0 || j >= this.n_rows || 
            this.u[j][i] === "nan" || this.v[j][i] === "nan" || 
            this.u[j][i] === undefined || this.v[j][i] === undefined;
    }

    getFlow(x, y) {
        return [bilinear(x, y, this.u), bilinear(x, y, this.v)];
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

export { Particle, VectorField, bilinear, bicubic };