'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_URL } from '@/lib/config';
import { useNarratives } from '@/context/NarrativesContext';

interface SuggestedQuestionsProps {
  articleId: string;
  title: string;
  content: string;
  category: string;
  timePeriod: string;
  metrics: Record<string, any>;
}

export function SuggestedQuestions({
  articleId,
  title,
  content,
  category,
  timePeriod,
  metrics
}: SuggestedQuestionsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { suggestedQuestions, setSuggestedQuestions } = useNarratives();

  // Fetch questions when component mounts
  const fetchQuestions = async () => {
    try {
      // Check if we already have cached questions for this article
      if (suggestedQuestions[articleId]) {
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/narrative/article/${articleId}/suggested_questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      
      // Cache the questions
      setSuggestedQuestions(articleId, data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load suggested questions"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle question selection and get answer
  const handleQuestionSelect = async (question: string) => {
    try {
      setSelectedQuestion(question);
      setIsLoading(true);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          context: {
            title,
            content,
            category,
            time_period: timePeriod,
            metrics
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get answer');
      
      const data = await response.json();
      setAnswer(data.response);
    } catch (error) {
      console.error('Error getting answer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get answer"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load questions when component mounts
  useEffect(() => {
    fetchQuestions();
  }, [articleId]);

  // Get questions from cache or return empty array
  const questions = suggestedQuestions[articleId] || [];
  if (questions.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Questions ScrollView */}
      <div className="flex gap-2 overflow-x-auto py-2 hide-scrollbar">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn(
              "whitespace-nowrap flex items-center gap-2",
              selectedQuestion === question && "bg-primary text-primary-foreground"
            )}
            onClick={() => handleQuestionSelect(question)}
          >
            <StarIcon className="h-4 w-4" />
            <span>{question}</span>
          </Button>
        ))}
      </div>

      {/* Answer Display */}
      {selectedQuestion && (
        <div className="rounded-lg bg-muted p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Answer:</p>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}