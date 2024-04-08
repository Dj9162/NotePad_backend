import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://rajdhan617:UhGyCjqTMd4b8BeA@cluster0.nskiw9k.mongodb.net/').then(() => {
  console.log('Connected to MongoDB');
})
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  });

// Define MongoDB schema and model
interface Note {
  noteTitle: string;
  noteContent: string;
}

const NoteModel = mongoose.model<Note>('Note', new mongoose.Schema({
  noteTitle: String,
  noteContent: String,
}));

// Create Express app
const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Define endpoint to get all notes
app.get('/api/get-all-notes', async (req: Request, res: Response) => {
  try {
    const allNotes = await NoteModel.find();
    return res.status(200).json(allNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// Define endpoint to handle form data
app.post('/api/add-note', async (req: Request, res: Response) => {
  const { noteTitle, noteContent } = req.body;

  // Validate data
  if (!noteTitle || !noteContent) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    // Save data to MongoDB
    const newNote = new NoteModel({ noteTitle, noteContent });
    await newNote.save();

    return res.status(201).json({ message: 'Note added successfully' });
  } catch (error) {
    console.error('Error saving note:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Define endpoint to edit a note
app.put('/api/edit-note/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { noteTitle, noteContent } = req.body;

  try {
    const updatedNote = await NoteModel.findByIdAndUpdate(id, { noteTitle, noteContent }, { new: true });
    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    return res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Define endpoint to delete a note
app.delete('/api/delete-note/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedNote = await NoteModel.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// Define a route handler for the root URL
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
