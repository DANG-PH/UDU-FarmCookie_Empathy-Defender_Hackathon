"use client";
import React, { useState, useRef } from 'react';
import { Send, Heart, AlertCircle, CheckCircle, Zap, Shield, Smile, Frown, Key } from 'lucide-react';

type GameState = 'setup' | 'menu' | 'playing' | 'result';

interface Message {
  text: string;
  isPositive: boolean;
  emoji: string;
}

export default function EmpathyDefender() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');
  
  // Debug: Log environment variables
  console.log('🔑 API Key loaded:', apiKey ? 'Yes (hidden)' : 'No');
  console.log('🌐 Base URL:', process.env.NEXT_PUBLIC_BASE_URL);
  
  const [score, setScore] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; message: string }>({ 
    show: false, 
    correct: false, 
    message: '' 
  });
  const [streak, setStreak] = useState(0);
  const [emotions, setEmotions] = useState<{ x: number; y: number; emoji: string; id: number }[]>([]);
  const [round, setRound] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [locked, setLocked] = useState(false);

  // Analyze emotion using OpenAI API
  const analyzeEmotionWithAI = async (text: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an emotion analysis expert. Analyze whether a statement is negative, violent, offensive, or bullying. Reply only with "NEGATIVE" if negative or "POSITIVE" if positive.'
            },
            {
              role: 'user',
              content: `Analyze this statement: "${text}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid API response format');
      }
      
      const result = data.choices[0].message.content.trim().toLowerCase();
      return result.includes('negative');
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      // Fallback to rule-based
      return analyzeEmotionFallback(text);
    }
  };

  // Fallback when API fails - ask user to retry
  const analyzeEmotionFallback = (text: string): boolean => {
    throw new Error('Unable to analyze emotion. Please check your API connection.');
  };

  // Generate new statement using OpenAI
  const generateMessageWithAI = async (isNegative: boolean): Promise<string> => {
    try {
      const prompt = isNegative 
        ? 'Create 1 negative, bullying comment on social media in English (concise, 10-15 words). Return only the comment, no explanation.'
        : 'Create 1 positive, encouraging comment on social media in English (concise, 10-15 words). Return only the comment, no explanation.';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are creating examples for an educational game about fighting cyberbullying.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 50
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid API response format');
      }
      
      return data.choices[0].message.content.trim().replace(/['"]/g, '');
    } catch (error) {
      console.error('Error generating message:', error);
      throw new Error('Unable to create a new question. Please check your API key and internet connection.');
    }
  };

  const getRandomMessage = async () => {
    const isNegative = Math.random() > 0.5;
    return await generateMessageWithAI(isNegative);
  };

  const startGame = async () => {
    setLocked(false);   // 🔓 reset lock state
    setLoading(false);  // ⏳ reset loading state
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setRound(1);
    setUserInput('');
    setFeedback({ show: false, correct: false, message: '' });

    const newMessage = await getRandomMessage();
    setCurrentMessage(newMessage);
  };

  const addEmotionAnimation = (emoji: string) => {
    const newEmotion = {
      x: Math.random() * 80 + 10,
      y: 50,
      emoji: emoji,
      id: Date.now()
    };
    setEmotions(prev => [...prev, newEmotion]);
    setTimeout(() => {
      setEmotions(prev => prev.filter(e => e.id !== newEmotion.id));
    }, 2000);
  };

  const handleClassification = async (isNegative: boolean) => {
    if (round > 10 || locked) return;
    setLocked(true);
    setLoading(true);
    
    try {
      const actuallyNegative = await analyzeEmotionWithAI(currentMessage);
      const correct = isNegative === actuallyNegative;
      
      if (correct) {
        const points = 10 + streak * 5;
        setScore(prev => prev + points);
        setStreak(prev => prev + 1);
        addEmotionAnimation(isNegative ? '💔' : '💚');
        setFeedback({ 
          show: true, 
          correct: true, 
          message: `Correct! +${points} points ${streak > 0 ? `(Streak x${streak + 1})` : ''}` 
        });
      } else {
        setStreak(0);
        addEmotionAnimation('❌');
        setFeedback({ 
          show: true, 
          correct: false, 
          message: 'Not quite right. Read more carefully!' 
        });
      }
      
      setLoading(false);
      
      setTimeout(async () => {
        if (round >= 10) {
          setGameState('result');
        } else {
          setFeedback({ show: false, correct: false, message: '' });
          setRound(prev => prev + 1);
          const newMessage = await getRandomMessage();
          setCurrentMessage(newMessage);
          setLocked(false);
        }
      }, 2000);
    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setFeedback({ 
        show: true, 
        correct: false, 
        message: `❌ ${errorMessage}` 
      });
      // Auto hide error after 5s
      setTimeout(() => {
        setFeedback({ show: false, correct: false, message: '' });
      }, 5000);
    }
  };

  const transformToPositive = async () => {
    if (round > 10 || locked) return;
    if (!userInput.trim()) return;
    
    setLocked(true);
    setLoading(true);
    
    try {
      const wasNegative = await analyzeEmotionWithAI(currentMessage);
      const nowPositive = !(await analyzeEmotionWithAI(userInput));
      
      if (wasNegative && nowPositive) {
        const healingPoints = 20 + streak * 10;
        setScore(prev => prev + healingPoints);
        setStreak(prev => prev + 1);
        addEmotionAnimation('✨');
        setFeedback({ 
          show: true, 
          correct: true, 
          message: `Awesome! You've healed this statement! +${healingPoints} points 💖` 
        });
      } else {
        setStreak(0);
        setFeedback({ 
          show: true, 
          correct: false, 
          message: 'Try transforming it into more positive words!' 
        });
      }
      
      setLoading(false);
      setUserInput('');
      
      setTimeout(async () => {
        if (round >= 10) {
          setGameState('result');
        } else {
          setFeedback({ show: false, correct: false, message: '' });
          setRound(prev => prev + 1);
          const newMessage = await getRandomMessage();
          setCurrentMessage(newMessage);
          setLocked(false); 
        }
      }, 2500);
    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setFeedback({ 
        show: true, 
        correct: false, 
        message: `❌ ${errorMessage}` 
      });
      // Auto hide error after 5s
      setTimeout(() => {
        setFeedback({ show: false, correct: false, message: '' });
      }, 5000);
    }
  };

  // Setup Screen - API Key Input
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <Key className="w-16 h-16 mx-auto text-pink-400 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">OpenAI API Setup</h2>
          
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-lg p-6 mb-4 border border-pink-500 border-opacity-30">
            <label className="block text-left text-sm font-semibold text-gray-300 mb-2">
              🔑 Enter OpenAI API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full bg-slate-700 text-white px-4 py-3 rounded border border-slate-600 focus:border-pink-500 focus:outline-none mb-3"
            />
            <p className="text-xs text-gray-400 text-left">
              💡 Your API key is only stored in this session and not sent anywhere except OpenAI
            </p>
          </div>

          <button
            onClick={() => apiKey.trim() && setGameState('menu')}
            disabled={!apiKey.trim()}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 rounded-lg transition"
          >
            Continue →
          </button>

          <div className="mt-4 text-xs text-gray-400">
            <p>🔒 Don't have an OpenAI API key?</p>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 underline"
            >
              Create one here (free $5 credit)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Menu Component
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8 animate-bounce">
            <Heart className="w-20 h-20 mx-auto text-pink-400 mb-4 fill-pink-400" />
            <h1 className="text-5xl font-bold text-white mb-2">EMPATHY DEFENDER</h1>
            <p className="text-pink-300 text-lg">Fight Cyberbullying - Spread Kindness</p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-lg p-6 mb-6 border border-pink-500 border-opacity-30">
            <h2 className="text-xl font-bold text-white mb-3">🎯 Game Objective</h2>
            <p className="text-gray-300 mb-4">
              Distinguish <span className="text-red-400 font-bold">negative</span> and <span className="text-green-400 font-bold">positive</span> comments on social media.
              Transform violent language into empathetic words!
            </p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-lg p-6 mb-6 border border-purple-500 border-opacity-30">
            <h3 className="text-lg font-bold text-white mb-3">📚 What You'll Learn:</h3>
            <div className="text-left text-gray-300 space-y-2 text-sm">
              <p>✅ Recognize harmful language</p>
              <p>💬 Transform negative comments into positive ones</p>
              <p>🛡️ Protect yourself from cyberbullying</p>
              <p>💖 Spread empathy and kindness</p>
            </div>
          </div>

          <div className="bg-green-600 bg-opacity-20 border border-green-500 rounded-lg p-3 mb-6">
            <p className="text-green-300 text-sm">
              🤖 <strong>Powered by OpenAI GPT</strong> - Auto-generated questions & intelligent analysis
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg"
          >
            ▶️ Start Game
          </button>

          <div className="mt-6 text-sm text-gray-400">
            <p>💡 Each correct classification: +10 points</p>
            <p>✨ Heal a statement: +20 points</p>
            <p>🔥 Streak combo: Points multiplied by 2x, 3x...</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center text-center p-6">
        <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">Completed 10 Rounds!</h1>
        <p className="text-pink-300 mb-6 text-lg">Your final score:</p>
        <div className="text-6xl font-extrabold text-green-400 mb-8">{score}</div>

        <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-lg p-6 border border-pink-500 border-opacity-30 max-w-md">
          <p className="text-gray-300 text-sm mb-2">💖 Thank you for spreading empathy!</p>
          <p className="text-gray-400 text-sm">Share this game with your friends!</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            🔁 Play Again
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            ⏪ Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Playing Component
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Emotion Animations */}
      {emotions.map(emotion => (
        <div
          key={emotion.id}
          className="absolute text-4xl"
          style={{
            left: `${emotion.x}%`,
            top: `${emotion.y}%`,
            animation: 'float 2s ease-out forwards'
          }}
        >
          {emotion.emoji}
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-10 h-10 text-pink-400 fill-pink-400" />
            <h1 className="text-4xl font-bold text-white">EMPATHY DEFENDER</h1>
          </div>
          <p className="text-pink-300">Identify & heal harmful language</p>
          <p className="text-gray-400 text-sm mt-1">🎮 Round {round}</p>
        </div>

        {/* Score & Streak */}
        <div className="flex gap-4 mb-6 justify-center">
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-pink-500 border-opacity-30 min-w-[150px] text-center">
            <div className="text-3xl font-bold text-pink-400">{score}</div>
            <div className="text-sm text-gray-400">Points</div>
          </div>
          {streak > 0 && (
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-lg p-4 border border-orange-500 border-opacity-30 min-w-[150px] text-center animate-pulse">
              <div className="text-3xl font-bold text-orange-400">🔥 x{streak}</div>
              <div className="text-sm text-gray-400">Streak</div>
            </div>
          )}
        </div>

        {/* Message Display */}
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-lg p-6 border border-purple-500 border-opacity-30 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              👤
            </div>
            <div className="flex-1 bg-slate-700 rounded-lg p-4">
              {currentMessage ? (
                <p className="text-white text-lg">{currentMessage}</p>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <Zap className="w-5 h-5 animate-spin" />
                  <span>Creating new question...</span>
                </div>
              )}
            </div>
          </div>

          {/* Classification Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleClassification(true)}
              disabled={loading || locked || !currentMessage}
              className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Frown className="w-5 h-5" />
              Negative 💔
            </button>
            <button
              onClick={() => handleClassification(false)}
              disabled={loading || locked || !currentMessage}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Smile className="w-5 h-5" />
              Positive 💚
            </button>
          </div>

          {/* Feedback */}
          {feedback.show && (
            <div className={`p-4 rounded-lg mb-4 ${feedback.correct ? 'bg-green-600' : 'bg-red-600'} bg-opacity-20 border ${feedback.correct ? 'border-green-500' : 'border-red-500'} animate-pulse`}>
              <p className="text-white text-center font-semibold">{feedback.message}</p>
            </div>
          )}

          {/* Healing Section */}
          <div className="border-t border-gray-600 pt-4">
            <label className="block text-sm font-semibold text-pink-300 mb-2">
              ✨ Heal: Transform this comment into positive words
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && userInput.trim() && transformToPositive()}
                placeholder="Example: You're amazing, keep pushing forward!"
                className="flex-1 bg-slate-700 text-white px-4 py-3 rounded border border-slate-600 focus:border-pink-500 focus:outline-none"
                disabled={loading || !currentMessage}
              />
              <button
                onClick={transformToPositive}
                disabled={loading || locked || !userInput.trim() || !currentMessage}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white px-6 py-3 rounded font-semibold transition flex items-center gap-2"
              >
                {loading ? <Zap className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5 fill-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-slate-800 bg-opacity-30 backdrop-blur rounded-lg p-4 border border-indigo-500 border-opacity-20">
          <p className="text-gray-300 text-sm text-center">
            💡 <span className="font-bold text-pink-300">Tip:</span> AI analyzes deep semantics beyond just words. 
            Pay attention to context and the real emotion behind the statement!
          </p>
        </div>
      </div>
    </div>
  );
}