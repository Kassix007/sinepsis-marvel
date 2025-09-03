"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, ArrowRight } from "lucide-react";

// Marvel trivia questions
const quizQuestions = [
  { question: "What is Captain America's shield made of?", options: ["Adamantium", "Vibranium", "Titanium", "Uru"], correctAnswer: 1 },
  { question: "Who is Tony Stark’s first AI assistant?", options: ["Ultron", "Friday", "J.A.R.V.I.S.", "Vision"], correctAnswer: 2 },
  { question: "Which Infinity Stone does Doctor Strange possess?", options: ["Time Stone", "Mind Stone", "Reality Stone", "Soul Stone"], correctAnswer: 0 },
  { question: "What is the real name of the Black Panther?", options: ["T'Chaka", "T'Challa", "M'Baku", "Killmonger"], correctAnswer: 1 },
  { question: "Which metal is found only in Wakanda?", options: ["Uru", "Adamantium", "Vibranium", "Promethium"], correctAnswer: 2 },
  { question: "What is Spider-Man’s real name?", options: ["Peter Quill", "Peter Parker", "Miles Morales", "Harry Osborn"], correctAnswer: 1 },
  { question: "Who is the Winter Soldier?", options: ["Bucky Barnes", "Sam Wilson", "Steve Rogers", "Clint Barton"], correctAnswer: 0 },
  { question: "Who was the villain in Avengers: Infinity War?", options: ["Loki", "Thanos", "Ultron", "Hela"], correctAnswer: 1 },
  { question: "What is Thor’s axe called?", options: ["Gungnir", "Stormbreaker", "Mjolnir", "Godslayer"], correctAnswer: 1 },
  { question: "What is Natasha Romanoff’s superhero alias?", options: ["Black Cat", "Scarlet Witch", "Black Widow", "Phantom"], correctAnswer: 2 },
  { question: "Which Guardian of the Galaxy says 'I am Groot'?", options: ["Rocket", "Drax", "Groot", "Mantis"], correctAnswer: 2 },
  { question: "Which superhero can manipulate probability with her powers?", options: ["Scarlet Witch", "Jean Grey", "Domino", "Storm"], correctAnswer: 2 },
  { question: "What newspaper does Peter Parker work for?", options: ["The Daily Bugle", "New York Times", "Daily Planet", "The Chronicle"], correctAnswer: 0 },
  { question: "Who is the half-sister of Thor?", options: ["Hela", "Valkyrie", "Sif", "Frigga"], correctAnswer: 0 },
  { question: "What is Deadpool’s real name?", options: ["Wade Wilson", "Logan Howlett", "Frank Castle", "Slade Wilson"], correctAnswer: 0 },
];

// Marvel quotes
const marvelQuotes = [
  "I am Iron Man. – Tony Stark",
  "Avengers, assemble! – Steve Rogers",
  "I can do this all day. – Steve Rogers",
  "I am Groot. – Groot",
  "Wakanda Forever! – T’Challa",
  "We are Groot. – Groot",
  "With great power comes great responsibility. – Uncle Ben",
  "She’s not alone. – Okoye",
];

export default function QuizModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(quizQuestions[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [unlockedQuote, setUnlockedQuote] = useState<string | null>(null);

  // Pop up every 3 minutes
  useEffect(() => {
    const openQuiz = () => {
      const randomIndex = Math.floor(Math.random() * quizQuestions.length);
      setCurrentQuestion(quizQuestions[randomIndex]);
      setSelectedAnswer(null);
      setShowResult(false);
      setUnlockedQuote(null);
      setIsOpen(true);
    };

    openQuiz(); // open immediately on page load
    const interval = setInterval(openQuiz, 3 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      const randomQuote = marvelQuotes[Math.floor(Math.random() * marvelQuotes.length)];
      setUnlockedQuote(randomQuote);
    }
    setShowResult(true);
  };

  const handleCloseQuiz = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md bg-slate-900 text-white border-2 border-red-600 shadow-2xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">{currentQuestion.question}</h2>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              className={`w-full px-4 py-2 rounded-lg border ${
                selectedAnswer === index ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {!showResult ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="mt-6 w-full bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold"
          >
            <Target className="w-5 h-5 mr-2" /> Submit Answer
          </Button>
        ) : (
          <div className="mt-6 text-center">
            {unlockedQuote ? (
              <>
                <p className="text-green-400 font-bold">✅ Correct!</p>
                <p className="mt-2 italic">“{unlockedQuote}”</p>
              </>
            ) : (
              <p className="text-red-400 font-bold">❌ Wrong Answer!</p>
            )}
            <Button
              onClick={handleCloseQuiz}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold"
            >
              <ArrowRight className="w-5 h-5 mr-2" /> Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
