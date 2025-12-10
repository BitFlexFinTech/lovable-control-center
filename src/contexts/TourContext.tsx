import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tour, TourProgress, TourChatMessage } from '@/types/tour';
import { defaultTours } from '@/data/tours';
import { generateQuickTour } from '@/utils/tourGenerator';
import { generateContextualResponse } from '@/utils/tourChatPrompt';

interface TourContextType {
  // Tour state
  activeTour: Tour | null;
  currentStep: number;
  isPlaying: boolean;
  
  // Tour management
  startTour: (tourId: string) => void;
  startCustomTour: (tour: Tour) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  endTour: () => void;
  
  // Progress
  availableTours: Tour[];
  completedTours: string[];
  tourProgress: Map<string, TourProgress>;
  
  // AI Chat
  chatMessages: TourChatMessage[];
  sendChatMessage: (content: string) => void;
  generateCustomTour: (query: string) => Tour;
  
  // Panel state
  isPanelOpen: boolean;
  togglePanel: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [tourProgress] = useState<Map<string, TourProgress>>(new Map());
  const [chatMessages, setChatMessages] = useState<TourChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your Control Center guide. Ask me anything about how to use the platform, or I can create a custom tour for you.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [customTours, setCustomTours] = useState<Tour[]>([]);

  const availableTours = [...defaultTours, ...customTours];

  const startTour = useCallback((tourId: string) => {
    const tour = availableTours.find(t => t.id === tourId);
    if (tour) {
      setActiveTour(tour);
      setCurrentStep(0);
      setIsPlaying(true);
    }
  }, [availableTours]);

  const startCustomTour = useCallback((tour: Tour) => {
    setCustomTours(prev => [...prev, tour]);
    setActiveTour(tour);
    setCurrentStep(0);
    setIsPlaying(true);
  }, []);

  const nextStep = useCallback(() => {
    if (activeTour && currentStep < activeTour.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tour completed
      if (activeTour) {
        setCompletedTours(prev => [...prev, activeTour.id]);
      }
      setActiveTour(null);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [activeTour, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const endTour = useCallback(() => {
    setActiveTour(null);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const generateCustomTour = useCallback((query: string): Tour => {
    return generateQuickTour(query);
  }, []);

  const sendChatMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: TourChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Generate response
    const response = generateContextualResponse(content);
    const tour = generateQuickTour(content);
    
    const assistantMessage: TourChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      suggestedTour: tour.steps.length > 1 ? tour : undefined,
    };
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 500);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStep,
        isPlaying,
        startTour,
        startCustomTour,
        nextStep,
        prevStep,
        skipStep,
        endTour,
        availableTours,
        completedTours,
        tourProgress,
        chatMessages,
        sendChatMessage,
        generateCustomTour,
        isPanelOpen,
        togglePanel,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
