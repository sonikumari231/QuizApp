import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const QuizScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [ques, setQues] = useState(0);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes timer in seconds
  const [timerEnded, setTimerEnded] = useState(false); // State to check if the timer has ended

  const getQuiz = async () => {
    setIsLoading(true);
    const url = 'https://opentdb.com/api.php?amount=10&type=multiple&encode=url3986';
    const res = await fetch(url);
    const data = await res.json();
    setQuestions(data.results);
    setOptions(generateOptionsAndShuffle(data.results[0]));
    setIsLoading(false);
  };

  useEffect(() => {
    getQuiz();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          setTimerEnded(true);
          Alert.alert('Time is up!', 'Your quiz time has ended.', [
            { text: 'OK', onPress: handleShowResult },
          ]);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleNextPress = () => {
    setQues(ques + 1);
    setOptions(generateOptionsAndShuffle(questions[ques + 1]));
  };

  const generateOptionsAndShuffle = (_question) => {
    const options = [..._question.incorrect_answers];
    options.push(_question.correct_answer);
    shuffleArray(options);
    return options;
  };

  const handleSelectedOption = (_option) => {
    if (_option === questions[ques].correct_answer) {
      setScore(score + 10);
    }
    if (ques !== 9) {
      setQues(ques + 1);
      setOptions(generateOptionsAndShuffle(questions[ques + 1]));
    }
  };

  const handleShowResult = () => {
    navigation.navigate('ResultScreen', { score }); // Only pass score
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (isLoading || !questions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

  // Check if the question exists before rendering
  const currentQuestion = questions[ques];
  if (!currentQuestion) {
    return <Text>Error: Question not found</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Timer at the top */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </Text>
      </View>
      
      {/* Question */}
      <View style={styles.top}>
        <Text style={styles.question}>
          <Text style={styles.questionNumber}>Q. </Text>
          {decodeURIComponent(currentQuestion.question)}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleSelectedOption(option)}
          >
            <Text style={styles.option}>{decodeURIComponent(option)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottom}>
        {ques !== 9 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleNextPress}>
            <Text style={styles.skipButtonText}>SKIP</Text>
          </TouchableOpacity>
        )}

        {ques === 9 && !timerEnded && (
          <TouchableOpacity style={styles.button} onPress={handleShowResult}>
            <Text style={styles.buttonText}>SHOW RESULTS</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    height: '100%',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  timerContainer: {
    marginBottom: 20, // Reduced space to bring timer closer to the top
    alignItems: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A759F',
  },
  top: {
    marginBottom: 20, // Space between question and options
    alignItems: 'center',
  },
  question: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  questionNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A759F',
  },
  options: {
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButton: {
    paddingVertical: 15,
    marginVertical: 8,
    backgroundColor: '#34A0A4',
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  option: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  bottom: {
    marginBottom: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1A759F',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  skipButton: {
    backgroundColor: '#34A0A4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
