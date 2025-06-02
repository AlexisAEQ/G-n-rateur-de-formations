import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, Clock, Trophy, RotateCcw, ChevronRight, ChevronLeft, Lightbulb, Target, Zap } from 'lucide-react';

const EnhancedQuizBlock = ({ quiz, onComplete, primaryColor = '#10b981' }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Timer global du quiz
  useEffect(() => {
    if (quizStarted && timeRemaining !== null && timeRemaining > 0 && !showResults) {
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
  }, [quizStarted, timeRemaining, showResults]);

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    if (quiz.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    }
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setShowExplanation(false);
  };

  const restartQuiz = () => {
    startQuiz();
  };

  const handleAnswer = (questionId, answerIndex, answerText = null) => {
    const questionTime = Date.now() - questionStartTime;
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        answer: answerIndex,
        text: answerText,
        timeSpent: questionTime
      }
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
    } else {
      handleSubmitQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = () => {
    const endTime = Date.now();
    const totalTimeSpent = Math.floor((endTime - startTime) / 1000);
    
    setShowResults(true);
    setQuizStarted(false);
    
    const score = calculateScore();
    const passed = score >= quiz.passingGrade;
    
    const results = {
      quizId: quiz.id,
      score,
      passed,
      totalTimeSpent,
      answers,
      timestamp: new Date().toISOString(),
      questionsCorrect: quiz.questions.filter(q => 
        answers[q.id] && answers[q.id].answer === q.correctAnswer
      ).length
    };
    
    localStorage.setItem(`quiz-results-${quiz.id}`, JSON.stringify(results));
    
    if (onComplete) {
      onComplete(results);
    }
  };

  const calculateScore = () => {
    if (quiz.questions.length === 0) return 0;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    
    quiz.questions.forEach(question => {
      totalPoints += question.points || 10;
      const userAnswer = answers[question.id];
      
      if (userAnswer) {
        if (question.type === 'text') {
          // Simple text matching for now - could be enhanced with fuzzy matching
          const isCorrect = userAnswer.text?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
          if (isCorrect) earnedPoints += (question.points || 10);
        } else {
          if (userAnswer.answer === question.correctAnswer) {
            earnedPoints += (question.points || 10);
          }
        }
      }
    });
    
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'boolean': return '✓/✗';
      case 'text': return '✍️';
      default: return '📝';
    }
  };

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  // Vue des résultats
  if (showResults) {
    const score = calculateScore();
    const passed = score >= quiz.passingGrade;
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="text-center mb-6">
          {passed ? (
            <div className="text-green-500 mb-4">
              <Trophy size={64} className="mx-auto animate-bounce" />
            </div>
          ) : (
            <div className="text-red-500 mb-4">
              <XCircle size={64} className="mx-auto" />
            </div>
          )}
          
          <h3 className="text-3xl font-bold mb-2 text-gray-800">
            {passed ? '🎉 Excellent travail !' : '📚 Continuez vos efforts !'}
          </h3>
          
          <div className={`text-6xl font-black mb-6 ${passed ? 'text-green-500' : 'text-red-500'}`}>
            {score}%
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(answers).length}
              </div>
              <div className="text-sm text-blue-700">Questions répondues</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">
                {quiz.questions.filter(q => 
                  answers[q.id] && answers[q.id].answer === q.correctAnswer
                ).length}
              </div>
              <div className="text-sm text-green-700">Bonnes réponses</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-purple-700">Temps total</div>
            </div>
          </div>
        </div>

        {/* Détail des réponses */}
        {quiz.showExplanations && (
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-800 text-lg">📋 Détail des réponses</h4>
            
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer && userAnswer.answer === question.correctAnswer;
              
              return (
                <div key={question.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-start space-x-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle size={20} className="text-red-500 mt-1 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 mb-2">
                        <span className="text-sm text-gray-500 mr-2">{getQuestionTypeIcon(question.type)}</span>
                        {question.question}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {question.type === 'text' ? (
                          <div>
                            <div className={`${isCorrect ? 'text-green-700' : 'text-red-700'} font-medium`}>
                              Votre réponse: "{userAnswer?.text || 'Non répondue'}"
                            </div>
                            {!isCorrect && (
                              <div className="text-green-700 font-medium">
                                Réponse attendue: "{question.correctAnswer}"
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className={`${isCorrect ? 'text-green-700' : 'text-red-700'} font-medium`}>
                              Votre réponse: {question.options?.[userAnswer?.answer] || 'Non répondue'}
                            </div>
                            {!isCorrect && (
                              <div className="text-green-700 font-medium">
                                Bonne réponse: {question.options?.[question.correctAnswer]}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {question.explanation && (
                          <div className="bg-blue-50 rounded-lg p-3 mt-2">
                            <div className="flex items-start space-x-2">
                              <Lightbulb size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-blue-800 text-sm">{question.explanation}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={restartQuiz}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium"
          >
            <RotateCcw size={20} />
            <span>Reprendre le quiz</span>
          </button>
          
          {passed && (
            <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium">
              <Trophy size={20} />
              <span>Quiz réussi !</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue de démarrage
  if (!quizStarted) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain size={36} className="text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {quiz.title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            Testez vos connaissances avec ce quiz interactif.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
              <div className="text-sm text-blue-700">Questions</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{quiz.passingGrade}%</div>
              <div className="text-sm text-green-700">Note requise</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">
                {quiz.timeLimit || '∞'}
              </div>
              <div className="text-sm text-purple-700">Minutes allouées</div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600">
                {quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0)}
              </div>
              <div className="text-sm text-orange-700">Points total</div>
            </div>
          </div>
          
          <button
            onClick={startQuiz}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 mx-auto font-medium shadow-lg"
          >
            <Target size={24} />
            <span>Commencer le quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // Vue du quiz en cours
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      {/* En-tête avec progression */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Question {currentQuestion + 1} sur {quiz.questions.length}
          </h3>
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <span>{getQuestionTypeIcon(currentQ.type)}</span>
            <span>{currentQ.type === 'boolean' ? 'Vrai/Faux' : currentQ.type === 'text' ? 'Réponse libre' : 'Choix multiple'}</span>
          </div>
        </div>
        
        {timeRemaining !== null && (
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-500">Temps restant</div>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
        <div
          className="h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-xl font-medium text-gray-800 mb-6 leading-relaxed">
          {currentQ.question}
        </h4>
        
        {currentQ.type === 'text' ? (
          /* Réponse libre */
          <div className="space-y-4">
            <textarea
              placeholder="Tapez votre réponse ici..."
              value={answers[currentQ.id]?.text || ''}
              onChange={(e) => handleAnswer(currentQ.id, null, e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
              rows="4"
            />
          </div>
        ) : (
          /* Choix multiple / Vrai-Faux */
          <div className="space-y-3">
            {currentQ.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  answers[currentQ.id]?.answer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={index}
                  checked={answers[currentQ.id]?.answer === index}
                  onChange={() => handleAnswer(currentQ.id, index)}
                  className="sr-only"
                />
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  answers[currentQ.id]?.answer === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQ.id]?.answer === index && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                
                <span className="text-gray-800 flex-1">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {/* Points pour cette question */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Points: {currentQ.points || 10}</span>
          {answers[currentQ.id] && (
            <span className="flex items-center space-x-1 text-green-600">
              <CheckCircle size={14} />
              <span>Répondue</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft size={16} />
          <span>Précédent</span>
        </button>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{Object.keys(answers).length} / {quiz.questions.length} répondues</span>
          {quiz.questions.length > 1 && (
            <div className="flex space-x-1">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentQuestion
                      ? 'bg-blue-500'
                      : answers[quiz.questions[index].id]
                        ? 'bg-green-400'
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={nextQuestion}
          disabled={!answers[currentQ.id]}
          className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <span>
            {currentQuestion === quiz.questions.length - 1 ? 'Terminer' : 'Suivant'}
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default EnhancedQuizBlock;