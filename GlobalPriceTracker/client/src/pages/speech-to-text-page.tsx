import React, { useState } from 'react';
import { LayoutGrid, Headphones, Search, MessageSquare, Keyboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SpeechToTextRecorder from '@/components/speech-to-text/SpeechToTextRecorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  height: string;
  placeholder: string;
  autoStart?: boolean;
}

const SpeechToTextPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const { toast } = useToast();
  
  const useCases: UseCase[] = [
    {
      id: 'dictation',
      title: 'General Dictation',
      description: 'Dictate notes, reports, or any text content hands-free',
      icon: <MessageSquare className="h-5 w-5" />,
      height: '300px',
      placeholder: 'Start speaking to dictate your text...',
      autoStart: true
    },
    {
      id: 'search',
      title: 'Voice Search',
      description: 'Search for products or information using your voice',
      icon: <Search className="h-5 w-5" />,
      height: '150px',
      placeholder: 'Say what you want to search for...'
    },
    {
      id: 'messaging',
      title: 'Voice Messaging',
      description: 'Compose messages or emails using speech',
      icon: <MessageSquare className="h-5 w-5" />,
      height: '250px',
      placeholder: 'Speak to compose your message...'
    },
    {
      id: 'notes',
      title: 'Quick Notes',
      description: 'Take quick notes during meetings or on the go',
      icon: <Keyboard className="h-5 w-5" />,
      height: '200px',
      placeholder: 'Your notes will appear here as you speak...'
    }
  ];
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter or speak a search term first.",
        variant: "destructive"
      });
      return;
    }
    
    // Redirect to search page with the query
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter or speak a message first.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });
    
    setMessage('');
  };
  
  const handleSaveNote = () => {
    if (!note.trim()) {
      toast({
        title: "Empty Note",
        description: "Please enter or speak a note first.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully.",
    });
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Speech-to-Text Technology</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Convert your speech to text in real-time for multiple uses. Our non-stop speech recognition 
          technology works across multiple languages and can be used for dictation, search, messaging, and more.
        </p>
      </div>
      
      <Tabs defaultValue="dictation" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
          {useCases.map((useCase) => (
            <TabsTrigger key={useCase.id} value={useCase.id} className="flex items-center space-x-2">
              {useCase.icon}
              <span>{useCase.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* General Dictation */}
        <TabsContent value="dictation">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>General Dictation</CardTitle>
                <CardDescription>
                  Dictate any content hands-free. Perfect for writing documents, emails, 
                  or any text while multitasking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpeechToTextRecorder 
                  height="300px"
                  placeholder="Your dictation will appear here as you speak..."
                  autoStart={true}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Pro Tip: Speak clearly and at a moderate pace for best results
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Voice Search */}
        <TabsContent value="search">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Voice Search</CardTitle>
                <CardDescription>
                  Speak your search query instead of typing. Great for finding products quickly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SpeechToTextRecorder 
                    height="150px"
                    placeholder="Say what you want to search for..."
                    onTranscriptChange={setSearchQuery}
                  />
                  
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search term..."
                      className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Say product names, categories, or store names to find what you're looking for
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Voice Messaging */}
        <TabsContent value="messaging">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Voice Messaging</CardTitle>
                <CardDescription>
                  Compose messages or emails using your voice instead of typing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SpeechToTextRecorder 
                    height="250px"
                    placeholder="Speak to compose your message..."
                    onTranscriptChange={setMessage}
                  />
                  
                  <Button onClick={handleSendMessage} className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  You can edit the text before sending if needed
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Quick Notes */}
        <TabsContent value="notes">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Notes</CardTitle>
                <CardDescription>
                  Take quick notes during meetings or on the go using voice input.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SpeechToTextRecorder 
                    height="200px"
                    placeholder="Your notes will appear here as you speak..."
                    onTranscriptChange={setNote}
                  />
                  
                  <Button onClick={handleSaveNote} className="w-full">
                    <Keyboard className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Notes are automatically saved to your account when signed in
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-12 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Tips for Better Speech Recognition</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Speak clearly and at a moderate pace</li>
          <li>Minimize background noise when possible</li>
          <li>Use a good quality microphone for better results</li>
          <li>For punctuation, say the name of the punctuation mark (e.g., "period", "comma", "question mark")</li>
          <li>To start a new paragraph, say "new paragraph" or "new line"</li>
          <li>If recognition seems off, try switching to a different language variant</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechToTextPage;