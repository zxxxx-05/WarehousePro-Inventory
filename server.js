require('dotenv').config()
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()
const PORT = process.env.PORT
const client = new MongoClient(process.env.MONGODB_URI)
const db = client.db(process.env.DB_NAME)
const collection = db.collection(process.env.COLLECTION_NAME)

app.use(express.json())

app.post('/api/items', async (req, res) => {
  try {
    const newItem = req.body
    const result = await collection.insertOne(newItem)
    const createdItem = await collection.findOne({ _id: result.insertedId })
    res.status(201).json(createdItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/items', async (req, res) => {
  try {
    const items = await collection.find({}).toArray()
    res.status(200).json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/items/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id)
    const item = await collection.findOne({ _id: id })
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    res.status(200).json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.put('/api/items/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id)
    const updateData = req.body
    const result = await collection.updateOne(
      { _id: id },
      { $set: updateData }
    )
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Item not found or no changes made' })
    }
    const updatedItem = await collection.findOne({ _id: id })
    res.status(200).json(updatedItem)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/items/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id)
    const result = await collection.deleteOne({ _id: id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' })
    }
    res.status(200).json({ message: 'Item deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

async function connectDB() {
  try {
    await client.connect()
    console.log('Connected to MongoDB Atlas successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

app.listen(PORT, () => {
  connectDB()
  console.log(`Server running on http://localhost:${PORT}`)
})