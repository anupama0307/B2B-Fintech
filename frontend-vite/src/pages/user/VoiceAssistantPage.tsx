import { useState, useRef } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, MessageSquare, Trash2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import api from '@/services/api';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    suggestedAction?: string;
    isError?: boolean;
}

export default function VoiceAssistantPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAiThinking, setIsAiThinking] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const getToken = () => localStorage.getItem('token');

    const scrollToBottom = () => {
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const startRecording = async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    await processAudio(audioBlob);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please allow microphone access.');
            } else {
                setError('Failed to start recording. Use text input instead.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        try {
            // CRITICAL FIX: Use FormData with explicit filename
            const formData = new FormData();
            // The third argument (filename) is REQUIRED for backend to accept the file
            formData.append('file', audioBlob, 'audio.wav');

            console.log('Uploading audio with FormData, filename: audio.wav');

            const response = await axios.post('http://localhost:8000/upload/audio/transcribe', formData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                    // DO NOT set Content-Type - axios handles multipart/form-data automatically
                }
            });

            console.log('Transcription response:', response.data);

            const transcription = response.data.transcription || response.data.text;
            if (transcription && transcription.trim()) {
                await sendToAI(transcription.trim());
            } else {
                setError('Could not transcribe audio. Please try text input.');
            }
        } catch (err: any) {
            console.error('Transcription error:', err.response?.data);
            const detail = err.response?.data?.detail || '';
            if (detail.includes('GEMINI') || detail.includes('API')) {
                setError('Voice transcription requires valid GEMINI_API_KEY. Use text input.');
            } else {
                setError(detail || 'Transcription failed. Use text input.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const sendToAI = async (message: string) => {
        if (!message.trim()) return;

        // Immediately add user message and set loading
        setIsAiThinking(true);
        setError('');

        const userMessage: ChatMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            // Send to AI with correct payload format
            const response = await api.post('/agent/chat', { query: message.trim() });

            console.log('AI response:', response.data);

            // CRITICAL: Check response.data exists before accessing
            if (response.data && response.data.response) {
                const aiMessage: ChatMessage = {
                    role: 'assistant',
                    content: response.data.response,
                    suggestedAction: response.data.suggested_action
                };
                setChatHistory(prev => [...prev, aiMessage]);
            } else {
                throw new Error('Empty response from AI');
            }

        } catch (err: any) {
            console.error('Chat error:', err.response?.data || err.message);

            // Show error but add error message to chat
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again or contact support.',
                isError: true
            };
            setChatHistory(prev => [...prev, errorMessage]);
            setError('AI failed to reply. Check if GEMINI_API_KEY is configured.');
        } finally {
            setIsAiThinking(false); // MUST happen even on error
            scrollToBottom();
        }
    };

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim() && !isAiThinking) {
            const message = textInput.trim();
            setTextInput('');
            await sendToAI(message);
        }
    };

    const clearChat = () => {
        setChatHistory([]);
        setError('');
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Voice Assistant</h1>
                        <p className="text-lg text-muted-foreground mt-1">Ask about your loans using voice or text</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-base">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Voice Controls */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Mic className="w-5 h-5" />
                                    Voice Input
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center py-8">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={isProcessing || isAiThinking}
                                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording
                                            ? 'bg-red-500 text-white animate-pulse scale-110'
                                            : isProcessing
                                                ? 'bg-muted cursor-wait'
                                                : 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl'
                                        }`}
                                >
                                    {isRecording ? (
                                        <MicOff className="w-14 h-14" />
                                    ) : isProcessing ? (
                                        <Loader2 className="w-14 h-14 animate-spin" />
                                    ) : (
                                        <Mic className="w-14 h-14" />
                                    )}
                                </button>
                                <p className="text-base text-muted-foreground mt-6 text-center">
                                    {isRecording
                                        ? 'Recording... Click to stop'
                                        : isProcessing
                                            ? 'Processing audio...'
                                            : 'Click to start speaking'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Chat */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <MessageSquare className="w-5 h-5" />
                                    Conversation
                                </CardTitle>
                                {chatHistory.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2">
                                        <Trash2 className="w-4 h-4" /> Clear
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 overflow-y-auto border rounded-xl p-4 mb-4 space-y-4 bg-muted/20">
                                    {chatHistory.length === 0 && !isAiThinking && (
                                        <div className="text-center py-16 text-muted-foreground">
                                            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg">Start a conversation</p>
                                            <p className="text-base">Record your voice or type below</p>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] px-4 py-3 rounded-xl ${msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : msg.isError
                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                        : 'bg-muted'
                                                }`}>
                                                <p className="text-base leading-relaxed">{msg.content}</p>
                                                {msg.suggestedAction && (
                                                    <p className="text-sm mt-2 opacity-70">Suggestion: {msg.suggestedAction}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiThinking && (
                                        <div className="flex justify-start">
                                            <div className="bg-muted px-4 py-3 rounded-xl flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-base">Thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <form onSubmit={handleTextSubmit} className="flex gap-3">
                                    <Input
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Type your question..."
                                        className="h-12 text-base"
                                        disabled={isAiThinking}
                                    />
                                    <Button type="submit" size="lg" disabled={!textInput.trim() || isAiThinking} className="px-6">
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
