import express from "express"
import "dotenv/config"
import { z } from "zod"
import { Producto } from "./domain/producto.js"
import { Categoria } from "./domain/categoria.js"
import { precioMenorQue } from "./funciones.js"
import { NOT_FOUND } from "./statuscodes.js"
const PATH_PRODUCTOS_V1 = "/api/v1/productos"

const idTransform = z.string().transform(((val, ctx) => {
    const num = Number(val);
    if (isNaN(num)) {
      ctx.addIssue({
        code: "INVAILD_ID",
        message: 'id must be a number',
      });
      return z.NEVER;
    }
    return num;
}))

const productSchema = z.object({
    nombre: z.string().min(3).max(10),
    descripcion: z.string(),
    precioBase: z.number().nonnegative()
})


const app = express()

app.use(express.json())

app.get("/healthcheck", (req, res) => {
    res.json({
        "status": "ok"
    })
})

const productos = []
const p1 = new Producto("Coca-Cola", 2500, "1,5lt")
const p2 = new Producto("Aceite", 5000, "1lt")
agregar(productos, p1)
agregar(productos, p2)

const categorias = []

const c1 = new Categoria("Alimentos")
c1.agregarProducto(p1)
c1.agregarProducto(p2)

const c2 = new Categoria("Limpieza")

agregar(categorias, c1)
agregar(categorias, c2)

function agregar(lista, elemento) {
    elemento.id = lista.length + 1
    lista.push(elemento)
}

function buscarPorId(lista, id) {
    return lista.filter(p => p.id === id)[0]
}

function buscarPorNombre(lista, nombre) {
    return lista.filter(p => p.nombre === nombre)[0]
}

function productoADTO(producto) {
    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "precioBase": producto.precioBase,
        "descripcion": producto.descripcion
    }
}

function productosADTOs(productos) {
    return productos.map(p => productoADTO(p))
}

app.get(PATH_PRODUCTOS_V1, (req, res) => {
    const price_lt = req.query.price_lt

    if (!price_lt) {
        res.json(productosADTOs(productos))
        return
    }

    res.json(productosADTOs(precioMenorQue(productos, price_lt)))
})

app.get(PATH_PRODUCTOS_V1 + "/:id", (req, res) => {
    const resultId = idTransform.safeParse(req.params.id)

    if (resultId.error) {
        res.status(400).json(resultId.error.issues)
        return
    }

    const id = resultId.data
    const producto = buscarPorId(productos, id)

    if (!producto) {
        res.status(NOT_FOUND).json({"error": "No se encontro un producto con ese ID"})  
        return
    }

    res.json(productoADTO(producto))
})

app.post(PATH_PRODUCTOS_V1, (req, res) => {
    const body = req.body
    const resultBody = productSchema.safeParse(body)

    if (resultBody.error) {
        res.status(400).json(resultBody.error.issues)
        return
    }

    const nuevoProductoDTO = resultBody.data

    const productoExistente = buscarPorNombre(productos, nuevoProductoDTO.nombre)

    if (productoExistente) {
        res.status(409).json({"error": "Ya existe un producto con ese nombre"})
        return
    }

    const nuevoProducto = new Producto(nuevoProductoDTO.nombre, nuevoProductoDTO.precioBase, nuevoProductoDTO.descripcion)
    agregar(productos, nuevoProducto)

    res.status(201).json(productoADTO(nuevoProducto))
})

app.delete(PATH_PRODUCTOS_V1 + "/:id", (req, res) => {
    const resultId = idTransform.safeParse(req.params.id)

    if (resultId.error) {
        res.status(400).json(resultId.error.issues)
        return
    }

    const id = resultId.data
    const producto = buscarPorId(productos, id)

    if (!producto) {
        res.status(NOT_FOUND).json({"error": "No se encontro un producto con ese ID"})  
        return
    }

    const indice = productos.indexOf(producto)
    productos.splice(indice, 1)

    res.status(204).send()
})

app.put(PATH_PRODUCTOS_V1 + "/:id", (req, res) => {
    const body = req.body
    const resultBody = productSchema.safeParse(body)

    if (resultBody.error) {
        res.status(400).json(resultBody.error.issues)
        return
    }

    const updateData = resultBody.data

    const resultId = idTransform.safeParse(req.params.id)

    if (resultId.error) {
        res.status(400).json(resultId.error.issues)
        return
    }

    const id = resultId.data

    const productoExistenteNombre = buscarPorNombre(productos, updateData.nombre)

    const productoExistente = buscarPorId(productos, id)

    if (!productoExistente) {
        res.status(404).json({"error": "No existe un produtcto con ese ID"})
        return
    }

    if (productoExistenteNombre && (productoExistenteNombre.id != id)) {
        res.status(409).json({"error": "Ya existe otro producto con ese nombre"})
        return
    }

    productoExistente.nombre = updateData.nombre
    productoExistente.precioBase = updateData.precioBase
    productoExistente.descripcion = updateData.descripcion

    // guardado en DB

    res.status(200).json(
        productoADTO(productoExistente)
    )

})

app.get("/api/v1/categorias/:id/productos", (req, res) => {
    const resultPathParam = idTransform.safeParse(req.params.id)

    if (resultPathParam.error) {
        res.status(400).json(resultPathParam.error.issues)
        return
    }

    const id = resultPathParam.data

    const categoria = buscarPorId(categorias, id)

    if (!categoria) {
        res.status(404).json({"error": "No existe una categoria con ese ID"})
        return
    }

    res.status(200).json(productosADTOs(categoria.productos))
})

const port = process.env.SERVER_PORT ?? 3000
app.listen(port, () => {
    console.log("El servidor arranco correctamente en el puerto " + port)
})