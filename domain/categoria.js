export class Categoria {
    #id
    #nombre
    #productos = []

    constructor(nombre) {
        this.#nombre = nombre
    }

    agregarProducto(p) {
        this.#productos.push(p)
    }

    get nombre() {
        return this.#nombre
    }

    get productos() {
        return this.#productos
    }

    set id(id) {
        this.#id = id
    }

    get id() {
        return this.#id
    }
}
