import React, { useState, useRef } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import api from "../../services/api";
import {
  MicrophoneIcon,
  StopIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

export default function VoiceAssistantPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setError("");
      setTranscription("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone and try again.");
      } else {
        setError("Failed to start recording. Please try again.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice_note.webm");

      const response = await api.post("/upload/audio/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTranscription(
        response.data.transcription || response.data.text || "No transcription returned"
      );
    } catch (err) {
      console.error("Error transcribing audio:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Transcription failed");
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Failed to transcribe audio. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToChat = async () => {
    if (!transcription.trim()) return;

    const userMessage = transcription.trim();

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setTranscription("");
    setIsAiThinking(true);

    try {
      const response = await api.post("/agent/chat", { query: userMessage });

      // Add AI response to chat
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: response.data.response,
        suggestedAction: response.data.suggested_action
      }]);
    } catch (err) {
      console.error("Error sending to AI:", err);
      const detail = err.response?.data?.detail;
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: typeof detail === 'string' ? detail : "Sorry, I couldn't process your request. Please try again.",
        isError: true
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleClear = () => {
    setTranscription("");
    setError("");
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              🎤 Voice Assistant
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Record your voice and chat with our AI financial assistant
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recording Section */}
            <div className="card animate-slide-up">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <MicrophoneIcon className="w-5 h-5 text-primary-500" />
                Voice Recording
              </h2>

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 ${isRecording
                    ? "bg-red-100 dark:bg-red-900/30 animate-pulse"
                    : "bg-primary-100 dark:bg-primary-900/30"
                  }`}>
                  <MicrophoneIcon className={`w-16 h-16 ${isRecording ? "text-red-500" : "text-primary-500"
                    }`} />
                </div>

                <p className={`text-lg font-medium mt-4 ${isRecording
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                  }`}>
                  {isRecording
                    ? "🔊 Listening..."
                    : isProcessing
                      ? "⏳ Processing..."
                      : "Press the button to start recording"}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="btn-accent flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <MicrophoneIcon className="w-5 h-5" />
                        Start Recording
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 animate-pulse"
                  >
                    <StopIcon className="w-5 h-5" />
                    Stop Recording
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* Transcription Result */}
              {transcription && (
                <div className="mt-6 animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📝 Transcription:
                  </label>
                  <div className="bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                      "{transcription}"
                    </p>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={handleSendToChat}
                      disabled={isAiThinking}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                      Send to AI
                    </button>
                    <button
                      onClick={handleClear}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                <h3 className="font-semibold text-primary-800 dark:text-primary-300 mb-2">
                  💡 Tips:
                </h3>
                <ul className="text-sm text-primary-700 dark:text-primary-400 space-y-1">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Try: "What's my loan status?"</li>
                  <li>• Try: "I want to apply for a loan of 50,000 rupees"</li>
                </ul>
              </div>
            </div>

            {/* Chat Section */}
            <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-accent-500" />
                  AI Conversation
                </h2>
                {chatHistory.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Clear Chat
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto space-y-4 mb-4 pr-2">
                {chatHistory.length === 0 && !isAiThinking && (
                  <div className="text-center py-12">
                    <SparklesIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Record your voice and send it to start a conversation
                    </p>
                  </div>
                )}

                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : message.isError
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-bl-md'
                          : 'bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 rounded-bl-md'
                      }`}>
                      <p className="leading-relaxed">{message.content}</p>
                      {message.suggestedAction && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <span className="text-xs opacity-80">💡 {message.suggestedAction}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
