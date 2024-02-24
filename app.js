const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null
const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost/3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initialize()

const ConvertingMoviedbObjToResponseObj = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const ConvertingDirectordbObjToResponseObj = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//API1
app.get('/movies/', async (request, response) => {
  const getMovieNames = `
      SELECT 
        movie_name
      FROM 
        movie
  `
  const api1 = await db.all(getMovieNames)
  response.send(api1.map(i => ConvertingMoviedbObjToResponseObj(i)))
})

//API2
app.post('/movies/', async (request, response) => {
  const details = request.body
  const CreateMovie = `
      INSERT INTO
        movie (director_id, movie_name,lead_actor )
      VALUES
      (${details.directorId}, 
      '${details.movieName}', 
      '${details.leadActor}')
  `
  await db.run(CreateMovie)
  response.send('Movie Successfully Added')
})

//API3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieId = `
    SELECT 
      *
    FROM
    movie
    WHERE
    movie_id= ${movieId}
  `
  const api3 = await db.get(getMovieId)

  response.send(ConvertingMoviedbObjToResponseObj(api3))
})

//API4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const UpdateQuery = `
    UPDATE movie
    SET 
    director_Id= ${movieDetails.directorId},
    movie_name= '${movieDetails.movieName}',
    lead_actor= '${movieDetails.leadActor}'
  `
  await db.run(UpdateQuery)
  response.send('Movie Details Updated')
})

//API5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id= ${movieId}
  `
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

//API6
app.get('/directors/', async (request, response) => {
  const getDirector = `
    SELECT * FROM director
  `
  const dir = await db.all(getDirector)
  response.send(dir.map(j => ConvertingDirectordbObjToResponseObj(j)))
})

//API7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const lastquery = `
      SELECT 
        movie_name
      FROM 
        movie
      WHERE 
        director_id='${directorId}'
  `
  const last = await db.all(lastquery)
  response.send(last.map(k => ({movieName: k.movie_name})))
})

module.exports = app
