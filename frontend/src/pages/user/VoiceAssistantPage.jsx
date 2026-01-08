import React, { useState, useRef } from "react";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import api from "../../services/api";

export default function VoiceAssistantPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setError("");
      setTranscription("");

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
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
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Create blob and send to backend
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
        setError(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
      } else if (err.name === "NotFoundError") {
        setError(
          "No microphone found. Please connect a microphone and try again."
        );
      } else {
        setError("Failed to start recording. Please try again.");
      }
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTranscription(
        response.data.transcription ||
          response.data.text ||
          "No transcription returned"
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

  const handleSendToChat = () => {
    // Navigate to chat with transcription (mock for now)
    if (transcription) {
      alert('Sending to AI Chat: "' + transcription + '"');
      // In a real implementation:
      // navigate('/chat', { state: { message: transcription } });
    }
  };

  const handleClear = () => {
    setTranscription("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            🎤 Voice Assistant
          </h1>

          <div className="max-w-2xl mx-auto">
            {/* Main Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              {/* Recording Section */}
              <div className="text-center mb-8">
                <div className="mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 ${
                      isRecording
                        ? "bg-red-100 dark:bg-red-900/30 animate-pulse"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    }`}
                  >
                    <span className="text-6xl">
                      {isRecording ? "🔴" : "🎤"}
                    </span>
                  </div>
                </div>

                {/* Status Text */}
                <p
                  className={`text-lg font-medium mb-4 ${
                    isRecording
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {isRecording
                    ? "🔊 Listening..."
                    : isProcessing
                    ? "⏳ Processing..."
                    : "Press the button to start recording"}
                </p>

                {/* Record/Stop Buttons */}
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isProcessing ? "⏳ Processing..." : "🎙️ Start Recording"}
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg animate-pulse"
                  >
                    ⏹️ Stop Recording
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-center">
                    {error}
                  </p>
                </div>
              )}

              {/* Transcription Result */}
              {transcription && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📝 Transcription Result:
                  </label>
                  <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                      "{transcription}"
                    </p>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={handleSendToChat}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      💬 Send to AI Chat
                    </button>
                    <button
                      onClick={handleClear}
                      className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                💡 Tips:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Ensure you're in a quiet environment</li>
                <li>• Use short, clear sentences for best results</li>
                <li>
                  • Try saying: "I want to apply for a loan of 50,000 rupees"
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
