export function precioMenorQue(productos, precio) {
    return productos.filter(p => p.precioBase <= precio)
}