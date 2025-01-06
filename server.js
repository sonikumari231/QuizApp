const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();    

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB   
mongoose.connect('mongodb://127.0.1:27017/quiz-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Schema and Model for storing quiz data
const quizSchema = new mongoose.Schema({
  question: String,
  correct_answer: String,
  incorrect_answers: [String],
});

const scoreSchema = new mongoose.Schema({
  user: String,
  score: Number,
  quizId: mongoose.Schema.Types.ObjectId,
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    isCorrect: Boolean
  }]
});

const Quiz = mongoose.model('Quiz', quizSchema);
const Score = mongoose.model('Score', scoreSchema);

// Routes

// Fetch questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Quiz.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Save user's score and answers
app.post('/api/submit', async (req, res) => {
  const { user, answers } = req.body;

  let score = 0;

  // Check answers and calculate score
  await answers.forEach(answer => {
    const correctAnswer =  Quiz.findById(answer.questionId).select('correct_answer');
    if (correctAnswer && correctAnswer.correct_answer === answer.selectedAnswer) {
      score += 10;
    }
  });

  // Save the score in the database
  const newScore = new Score({
    user,
    score,
    answers,
  });

  try {
    await newScore.save();
    res.status(200).json({ message: 'Score saved successfully', score });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// Starting server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
