export class Producto {
    #id
    #nombre
    #precioBase
    #descripcion

    constructor(nombre, precioBase, descripcion) {
        this.#nombre = nombre
        this.#descripcion = descripcion
        this.#precioBase = precioBase
    }

    get nombre() {
        return this.#nombre
    }

    get precioBase() {
        return this.#precioBase
    }

    get descripcion() {
        return this.#descripcion
    }

    set descripcion(descripcion) {
        this.#descripcion = descripcion
    }

    set nombre(nombre) {
        this.#nombre = nombre
    }

    set precioBase(precio) {
        this.#precioBase = precio
    }

    set id(id) {
        this.#id = id
    }

    get id() {
        return this.#id
    }
}
