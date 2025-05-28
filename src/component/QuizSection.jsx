import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, ChevronRight, AlertCircle } from 'lucide-react';

const QuizSection = ({ 
  assessment, 
  onComplete, 
  primaryColor = '#1e40af',
  passingGrade = 80 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Questions d'exemple basées sur l'évaluation
  const questions = React.useMemo(() => {
    if (!assessment?.exercises) return [];

    // Générer des questions basées sur les exercices
    return assessment.exercises.map((exercise, index) => ({
      id: index + 1,
      question: `Évaluation pratique : ${exercise}`,
      type: 'multiple',
      options: [
        'Procédure correctement exécutée',
        'Procédure partiellement exécutée',
        'Procédure nécessite des corrections',
        'Procédure non maîtrisée'
      ],
      correctAnswer: 0,
      explanation: `Cette évaluation porte sur votre capacité à : ${exercise.toLowerCase()}`
    }));
  }, [assessment]);

  // Timer pour le quiz
  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining]);

  // Commencer le quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
    setTimeRemaining(questions.length * 120); // 2 minutes par question
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  // Redémarrer le quiz
  const restartQuiz = () => {
    startQuiz();
  };

  // Répondre à une question
  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Passer à la question suivante
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  // Question précédente
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Soumettre le quiz
  const handleSubmitQuiz = () => {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    setShowResults(true);
    setQuizStarted(false);
    
    // Calculer le score
    const score = calculateScore();
    
    // Sauvegarder les résultats
    const results = {
      score,
      timeSpent,
      passed: score >= passingGrade,
      answers,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('quiz-results', JSON.stringify(results));
    
    if (onComplete) {
      onComplete(results);
    }
  };

  // Calculer le score
  const calculateScore = () => {
    if (questions.length === 0) return 0;
    
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / questions.length) * 100);
  };

  // Formater le temps
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Si pas d'assessment, afficher un message
  if (!assessment || !questions.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune évaluation disponible
        </h3>
        <p className="text-gray-600">
          Cette formation ne contient pas d'évaluation interactive.
        </p>
      </div>
    );
  }

  // Vue des résultats
  if (showResults) {
    const score = calculateScore();
    const passed = score >= passingGrade;
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center mb-6">
          {passed ? (
            <Trophy size={64} className="mx-auto text-yellow-500 mb-4" />
          ) : (
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          )}
          
          <h3 className="text-2xl font-bold mb-2">
            {passed ? 'Félicitations !' : 'Résultat insuffisant'}
          </h3>
          
          <div className="text-4xl font-bold mb-4" style={{ color: passed ? '#10b981' : '#ef4444' }}>
            {score}%
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-900">
                {Object.keys(answers).length}
              </div>
              <div className="text-sm text-gray-600">Questions répondues</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">
                {questions.filter(q => answers[q.id] === q.correctAnswer).length}
              </div>
              <div className="text-sm text-gray-600">Bonnes réponses</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-900">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-gray-600">Temps écoulé</div>
            </div>
          </div>
        </div>

        {/* Détail des réponses */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-900">Détail des réponses :</h4>
          
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {isCorrect ? (
                    <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle size={20} className="text-red-500 mt-1 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-2">
                      Question {index + 1}: {question.question}
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Votre réponse: {question.options[userAnswer] || 'Non répondue'}
                      </div>
                      
                      {!isCorrect && (
                        <div className="text-green-700">
                          Bonne réponse: {question.options[question.correctAnswer]}
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="text-gray-600 italic mt-2">
                          {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={restartQuiz}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={20} />
            <span>Reprendre l'évaluation</span>
          </button>
          
          {passed && (
            <button
              className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
              onClick={() => onComplete && onComplete({ score, passed, timeSpent })}
            >
              <Trophy size={20} />
              <span>Continuer</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Vue de démarrage
  if (!quizStarted) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Clock size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Évaluation de la formation
          </h3>
          
          <p className="text-gray-600 mb-6">
            Cette évaluation comprend {questions.length} questions pratiques.
            Vous devez obtenir au moins {passingGrade}% pour réussir.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{passingGrade}%</div>
              <div className="text-sm text-gray-600">Note de passage</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Math.ceil(questions.length * 2)}min
              </div>
              <div className="text-sm text-gray-600">Temps alloué</div>
            </div>
          </div>
          
          <button
            onClick={startQuiz}
            className="flex items-center space-x-2 px-8 py-3 text-white rounded-lg hover:opacity-90 transition-opacity mx-auto"
            style={{ backgroundColor: primaryColor }}
          >
            <Clock size={20} />
            <span>Commencer l'évaluation</span>
          </button>
        </div>
      </div>
    );
  }

  // Vue du quiz en cours
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Question {currentQuestion + 1} sur {questions.length}
          </h3>
          <div className="text-sm text-gray-600">
            Évaluation de formation
          </div>
        </div>
        
        {timeRemaining && (
          <div className="flex items-center space-x-2 text-right">
            <Clock size={16} className="text-gray-400" />
            <span className={`font-mono ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${progress}%`, 
            backgroundColor: primaryColor 
          }}
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-xl font-medium text-gray-900 mb-4">
          {currentQ.question}
        </h4>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                answers[currentQ.id] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQ.id}`}
                value={index}
                checked={answers[currentQ.id] === index}
                onChange={() => handleAnswer(currentQ.id, index)}
                className="sr-only"
              />
              
              <div 
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQ.id] === index
                    ? 'border-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {answers[currentQ.id] === index && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
              
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} className="rotate-180" />
          <span>Précédent</span>
        </button>

        <div className="text-sm text-gray-600">
          {Object.keys(answers).length} / {questions.length} répondues
        </div>

        <button
          onClick={nextQuestion}
          disabled={answers[currentQ.id] === undefined}
          className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{ backgroundColor: primaryColor }}
        >
          <span>
            {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default QuizSection;