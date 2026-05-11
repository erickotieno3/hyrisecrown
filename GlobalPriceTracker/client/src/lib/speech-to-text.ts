/**
 * SpeechToText Service
 * 
 * A service that provides continuous speech-to-text conversion using the Web Speech API.
 * This implementation allows for non-stop recognition by automatically restarting
 * the recognition process when it ends.
 */

// Define interfaces for better type checking
export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  isFinal: boolean;
}

class SpeechToTextService {
  private recognition: any;
  private isListening: boolean = false;
  private temporaryTranscript: string = '';
  private finalTranscript: string = '';
  private onResultCallback: (transcript: string, isFinal: boolean) => void = () => {};
  private onErrorCallback: (error: any) => void = () => {};
  private language: string = 'en-US';
  private autoRestart: boolean = true;

  constructor() {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition ||
                             (window as any).mozSpeechRecognition ||
                             (window as any).msSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.configureRecognition();
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }

  /**
   * Configure the speech recognition instance with default settings
   */
  private configureRecognition(): void {
    if (!this.recognition) return;
    
    this.recognition.lang = this.language;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    
    // Handle recognition results
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = this.finalTranscript;
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      this.finalTranscript = finalTranscript;
      this.temporaryTranscript = interimTranscript;
      
      // Call the result callback with the combined transcript
      const fullTranscript = finalTranscript + interimTranscript;
      this.onResultCallback(fullTranscript, event.results[event.resultIndex].isFinal);
    };
    
    // Handle recognition errors
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.onErrorCallback(event.error);
      
      // If there's an error, stop the recognition
      if (event.error === 'not-allowed') {
        this.isListening = false;
      }
    };
    
    // Handle recognition end
    this.recognition.onend = () => {
      // If auto-restart is enabled and we're still supposed to be listening,
      // restart the recognition process
      if (this.autoRestart && this.isListening) {
        this.recognition.start();
      } else {
        this.isListening = false;
      }
    };
  }

  /**
   * Start the speech recognition process
   */
  public start(options?: SpeechRecognitionOptions): void {
    if (!this.recognition) {
      this.onErrorCallback('Speech recognition not supported in this browser.');
      return;
    }
    
    if (this.isListening) {
      this.stop();
    }
    
    // Apply any custom options
    if (options) {
      if (options.language) this.recognition.lang = options.language;
      if (options.continuous !== undefined) this.recognition.continuous = options.continuous;
      if (options.interimResults !== undefined) this.recognition.interimResults = options.interimResults;
      if (options.maxAlternatives) this.recognition.maxAlternatives = options.maxAlternatives;
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      this.onErrorCallback(e);
    }
  }

  /**
   * Stop the speech recognition process
   */
  public stop(): void {
    if (!this.recognition || !this.isListening) return;
    
    this.autoRestart = false; // Disable auto-restart
    this.isListening = false;
    
    try {
      this.recognition.stop();
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
    }
  }

  /**
   * Pause the speech recognition process
   */
  public pause(): void {
    if (!this.recognition || !this.isListening) return;
    
    this.autoRestart = false; // Disable auto-restart
    
    try {
      this.recognition.stop();
    } catch (e) {
      console.error('Error pausing speech recognition:', e);
    }
  }

  /**
   * Resume the speech recognition process
   */
  public resume(): void {
    if (!this.recognition) return;
    
    this.autoRestart = true; // Enable auto-restart
    
    if (!this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        console.error('Error resuming speech recognition:', e);
        this.onErrorCallback(e);
      }
    }
  }

  /**
   * Reset the transcripts
   */
  public resetTranscript(): void {
    this.temporaryTranscript = '';
    this.finalTranscript = '';
  }

  /**
   * Set the callback function for recognition results
   */
  public onResult(callback: (transcript: string, isFinal: boolean) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set the callback function for recognition errors
   */
  public onError(callback: (error: any) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Check if speech recognition is supported in the current browser
   */
  public isSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * Get the current listening state
   */
  public getListeningState(): boolean {
    return this.isListening;
  }

  /**
   * Set the recognition language
   */
  public setLanguage(languageCode: string): void {
    this.language = languageCode;
    if (this.recognition) {
      this.recognition.lang = languageCode;
    }
  }

  /**
   * Get the current recognition language
   */
  public getLanguage(): string {
    return this.language;
  }
}

// Export a singleton instance
export const speechToText = new SpeechToTextService();

// Also export the class for testing or if multiple instances are needed
export default SpeechToTextService;