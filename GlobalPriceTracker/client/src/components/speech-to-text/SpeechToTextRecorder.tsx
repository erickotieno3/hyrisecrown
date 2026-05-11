import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Save, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { speechToText } from '@/lib/speech-to-text';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'sw-KE', name: 'Swahili' },
];

interface SpeechToTextRecorderProps {
  initialLanguage?: string;
  onTranscriptChange?: (transcript: string) => void;
  height?: string;
  showControls?: boolean;
  autoStart?: boolean;
  placeholder?: string;
}

const SpeechToTextRecorder: React.FC<SpeechToTextRecorderProps> = ({
  initialLanguage = 'en-US',
  onTranscriptChange,
  height = '200px',
  showControls = true,
  autoStart = false,
  placeholder = 'Your speech will appear here...',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState(initialLanguage);
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if speech recognition is supported
    setIsSupported(speechToText.isSupported());
    
    if (!speechToText.isSupported()) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    
    // Set initial language
    speechToText.setLanguage(language);
    
    // Set up result handler
    speechToText.onResult((text, isFinal) => {
      setTranscript(text);
      if (onTranscriptChange) {
        onTranscriptChange(text);
      }
    });
    
    // Set up error handler
    speechToText.onError((error) => {
      toast({
        title: "Speech Recognition Error",
        description: `Error: ${error}`,
        variant: "destructive",
      });
      setIsListening(false);
    });
    
    // Auto-start if enabled
    if (autoStart) {
      startListening();
    }
    
    // Clean up on component unmount
    return () => {
      speechToText.stop();
    };
  }, []);
  
  // Update language when changed
  useEffect(() => {
    speechToText.setLanguage(language);
  }, [language]);
  
  const startListening = () => {
    if (!isSupported) return;
    
    speechToText.start();
    setIsListening(true);
    
    toast({
      title: "Listening Started",
      description: "Speak now - your words will appear as text.",
    });
  };
  
  const stopListening = () => {
    if (!isSupported) return;
    
    speechToText.stop();
    setIsListening(false);
    
    toast({
      title: "Listening Stopped",
      description: "Speech recognition paused.",
    });
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const clearTranscript = () => {
    setTranscript('');
    speechToText.resetTranscript();
    
    if (onTranscriptChange) {
      onTranscriptChange('');
    }
    
    toast({
      title: "Transcript Cleared",
    });
  };
  
  const copyTranscript = () => {
    if (!transcript) {
      toast({
        title: "Nothing to Copy",
        description: "Generate some text first by speaking.",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(transcript).then(
      () => {
        toast({
          title: "Copied to Clipboard",
          description: "Text has been copied to your clipboard.",
        });
      },
      (err) => {
        toast({
          title: "Copy Failed",
          description: "Could not copy text to clipboard.",
          variant: "destructive",
        });
      }
    );
  };
  
  const saveTranscript = () => {
    if (!transcript) {
      toast({
        title: "Nothing to Save",
        description: "Generate some text first by speaking.",
        variant: "destructive",
      });
      return;
    }
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech-transcript-${new Date().toISOString().substring(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Transcript Saved",
      description: "Your transcript has been saved as a text file.",
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Speech to Text</CardTitle>
            <CardDescription>
              {isListening ? 'Listening... speak now' : 'Click the microphone to start'}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant={isListening ? "destructive" : "default"}
              onClick={toggleListening}
              disabled={!isSupported}
              size="icon"
              className="ml-2 flex-shrink-0"
            >
              {isListening ? <MicOff /> : <Mic />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            if (onTranscriptChange) {
              onTranscriptChange(e.target.value);
            }
          }}
          placeholder={placeholder}
          className="min-h-[150px] resize-none"
          style={{ height }}
        />
      </CardContent>
      
      {showControls && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={clearTranscript}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={copyTranscript}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={saveTranscript}>
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SpeechToTextRecorder;