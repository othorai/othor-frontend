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
  narrativeContext?: {
    description?: string;
    trend?: string;
    changePercentage?: number;
    previousValue?: number;
    currentValue?: number;
  };
}

export function SuggestedQuestions({
  articleId,
  title,
  content,
  category,
  timePeriod,
  metrics,
  narrativeContext
}: SuggestedQuestionsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { suggestedQuestions, setSuggestedQuestions } = useNarratives();

  const fetchQuestions = async () => {
    try {
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

  const handleQuestionSelect = async (question: string) => {
    try {
      setSelectedQuestion(question);
      setIsLoading(true);

      // Enhanced context object including narrative information
      const enhancedContext = {
        title,
        content,
        category,
        time_period: timePeriod,
        metrics,
        narrative: {
          ...narrativeContext,
          title,
          description: content,
          category,
          timeRange: timePeriod
        }
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          context: enhancedContext
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

  useEffect(() => {
    fetchQuestions();
  }, [articleId]);

  const questions = suggestedQuestions[articleId] || [];
  if (questions.length === 0) return null;

  const formatAnswer = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      const headingMatch = paragraph.match(/^(\d+\.\s+)\*\*(.*?)\*\*:/);
      if (headingMatch) {
        const [_, number, headingText] = headingMatch;
        const remainingText = paragraph.replace(/^(\d+\.\s+)\*\*(.*?)\*\*:/, '');
        return (
          <div key={index} className="mt-4 first:mt-0">
            <div className="flex gap-2">
              <span className="text-gray-700">{number}</span>
              <span className="font-semibold text-gray-900">{headingText}:</span>
            </div>
            <p className="mt-1 text-base text-gray-700 leading-relaxed">{remainingText}</p>
          </div>
        );
      }
      
      return paragraph.trim() && (
        <p key={index} className="text-base text-gray-700 leading-relaxed mt-4 first:mt-0">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="mt-8 space-y-6 border-t pt-6">
      <h4 className="font-medium text-gray-900">Suggested Questions</h4>
      
      <div className="flex gap-3 overflow-x-auto py-2 hide-scrollbar">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className={cn(
              "whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
              selectedQuestion === question ? 
                "bg-primary text-primary-foreground hover:bg-primary/90" : 
                "hover:bg-gray-100"
            )}
            onClick={() => handleQuestionSelect(question)}
          >
            <StarIcon className="h-4 w-4" />
            <span className="text-base">{question}</span>
          </Button>
        ))}
      </div>

      {selectedQuestion && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <h5 className="font-medium">Answer</h5>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="space-y-2">
                {formatAnswer(answer)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}