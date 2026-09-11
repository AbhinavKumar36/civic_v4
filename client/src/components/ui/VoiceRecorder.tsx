import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Mic, Square, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Defaulting to English (India), can be extended

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(prev => prev + ' ' + currentTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      onTranscript(transcript); // pass up state
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    onTranscript('');
  };

  return (
    <div className="space-y-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Voice Input</h4>
        {!isRecording ? (
          <Button type="button" onClick={startRecording} variant="outline" size="sm" className="text-blue-600 border-blue-600">
            <Mic size={16} className="mr-2" /> Start Recording
          </Button>
        ) : (
          <Button type="button" onClick={stopRecording} variant="destructive" size="sm">
            <Square size={16} className="mr-2" /> Stop Recording
          </Button>
        )}
      </div>
      
      {transcript && (
        <div className="mt-4">
          <p className="text-sm italic text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-900 rounded border">
            {transcript}
          </p>
          <div className="mt-2 flex justify-end">
            <Button type="button" onClick={clearTranscript} variant="ghost" size="sm" className="text-red-500">
              <Trash2 size={16} className="mr-2" /> Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
