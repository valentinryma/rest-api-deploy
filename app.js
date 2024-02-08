const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const { validateMovie } = require('./schemas/movies.js')
const app = express();
app.use(express.json()); // Middleware que nos permite utilizar req.body
app.disable('x-powered-by')

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)

    if (result.error) {
        // 422 Unprocessable Entity -> La sintaxis del recurso no era correcta.
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(), // Genera una id unica aleatoria.uuid v4
        ...result.data
        // Esto es peligroso si no validamos los datos previamente.
        // en este caso lo utilizamos porque validamos con zod los valores.
    }



    // Esto no seria REST, porque estamos guardando
    // el estado de la app en memoria
    movies.push(newMovie)

    res.status(201).json(newMovie)
    // 201: La request a finalizado correctamente y a creado un nuevo recurso

})

// _Todos los recursos que sean MOVIES se ideentifican con /movies
app.get('/movies', (req, res) => {
    // Query String
    const { genre } = req.query
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(gen => gen.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }

    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    movie ? res.json(movie) : res.status(404).json({ message: "Movie not found" })

    //:id se llama segmento dinamico, y son los "parametros" de la url
    // path-to-regex
})


const PORT = process.env.PORT ?? 1234;
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`)
})


