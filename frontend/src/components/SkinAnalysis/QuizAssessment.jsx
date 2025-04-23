import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Progress,
  useToast,
  Flex,
  Image,
  Divider
} from '@chakra-ui/react';
import { analyzeSkinQuiz } from '../../services/api';

const QuizAssessment = ({ onAnalysisComplete }) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    skinType: '',
    oiliness: '',
    sensitivity: '',
    concerns: [],
    acneFrequency: '',
    skinTone: '',
    aging: '',
    environment: '',
    allergies: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: 'skinType',
      question: 'How would you describe your skin type?',
      type: 'radio',
      options: [
        { value: 'dry', label: 'Dry - Often feels tight or flaky' },
        { value: 'oily', label: 'Oily - Shiny and greasy, especially in T-zone' },
        { value: 'combination', label: 'Combination - Oily T-zone, dry cheeks' },
        { value: 'normal', label: 'Normal - Neither too oily nor too dry' },
        { value: 'sensitive', label: 'Sensitive - Easily irritated, redness' }
      ]
    },
    {
      id: 'oiliness',
      question: 'How does your skin feel by midday?',
      type: 'radio',
      options: [
        { value: 'very_dry', label: 'Still feels dry or tight' },
        { value: 'normal', label: 'Comfortable, not particularly oily or dry' },
        { value: 'slightly_oily', label: 'Slightly shiny in the T-zone' },
        { value: 'very_oily', label: 'Very shiny/oily across most of face' }
      ]
    },
    {
      id: 'sensitivity',
      question: 'How does your skin react to new products?',
      type: 'radio',
      options: [
        { value: 'very_sensitive', label: 'Often gets red, itchy, or breaks out' },
        { value: 'somewhat_sensitive', label: 'Occasionally gets irritated' },
        { value: 'not_sensitive', label: 'Rarely has negative reactions' },
        { value: 'never_sensitive', label: 'Never has negative reactions' }
      ]
    },
    {
      id: 'concerns',
      question: 'What are your main skin concerns? (Select all that apply)',
      type: 'checkbox',
      options: [
        { value: 'acne', label: 'Acne or breakouts' },
        { value: 'blackheads', label: 'Blackheads or clogged pores' },
        { value: 'wrinkles', label: 'Fine lines and wrinkles' },
        { value: 'dullness', label: 'Dullness or uneven skin tone' },
        { value: 'dark_spots', label: 'Dark spots or hyperpigmentation' },
        { value: 'redness', label: 'Redness or inflammation' },
        { value: 'dryness', label: 'Dryness or flakiness' },
        { value: 'oiliness', label: 'Excess oil production' },
        { value: 'large_pores', label: 'Large or visible pores' },
        { value: 'dark_circles', label: 'Dark circles under eyes' }
      ]
    },
    {
      id: 'acneFrequency',
      question: 'How often do you experience breakouts?',
      type: 'radio',
      options: [
        { value: 'never', label: 'Never or rarely' },
        { value: 'occasionally', label: 'Occasionally (a few times a year)' },
        { value: 'monthly', label: 'Monthly (often hormonal)' },
        { value: 'weekly', label: 'Weekly or more frequently' },
        { value: 'constantly', label: 'Constantly dealing with active breakouts' }
      ]
    },
    {
      id: 'skinTone',
      question: 'What best describes your skin tone?',
      type: 'radio',
      options: [
        { value: 'very_fair', label: 'Very fair, always burns easily' },
        { value: 'fair', label: 'Fair, burns easily, tans minimally' },
        { value: 'medium', label: 'Medium, sometimes burns, tans gradually' },
        { value: 'olive', label: 'Olive, rarely burns, tans easily' },
        { value: 'tan', label: 'Tan, rarely burns, always tans well' },
        { value: 'deep', label: 'Deep, never burns' }
      ]
    },
    {
      id: 'aging',
      question: 'Which signs of aging concern you most? (Select all that apply)',
      type: 'checkbox',
      options: [
        { value: 'fine_lines', label: 'Fine lines' },
        { value: 'deep_wrinkles', label: 'Deep wrinkles' },
        { value: 'loss_of_firmness', label: 'Loss of firmness/elasticity' },
        { value: 'dullness', label: 'Dullness/lack of radiance' },
        { value: 'age_spots', label: 'Age spots/sun damage' },
        { value: 'none', label: 'None of these concern me right now' }
      ]
    },
    {
      id: 'environment',
      question: 'What type of environment do you live in?',
      type: 'radio',
      options: [
        { value: 'dry', label: 'Dry climate' },
        { value: 'humid', label: 'Humid climate' },
        { value: 'cold', label: 'Cold climate' },
        { value: 'hot', label: 'Hot climate' },
        { value: 'urban', label: 'Urban/high pollution' },
        { value: 'variable', label: 'Variable/seasonal changes' }
      ]
    },
    {
      id: 'allergies',
      question: 'Do you have any known allergies or sensitivities to ingredients? (Select all that apply)',
      type: 'checkbox',
      options: [
        { value: 'fragrance', label: 'Fragrance' },
        { value: 'alcohol', label: 'Alcohol' },
        { value: 'essential_oils', label: 'Essential oils' },
        { value: 'sulfates', label: 'Sulfates' },
        { value: 'parabens', label: 'Parabens' },
        { value: 'lanolin', label: 'Lanolin' },
        { value: 'none', label: 'No known allergies' }
      ]
    }
  ];

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    // Simple validation
    const currentQuestion = questions[currentStep];
    if (
      (currentQuestion.type === 'radio' && !answers[currentQuestion.id]) ||
      (currentQuestion.type === 'checkbox' && (!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0))
    ) {
      toast({
        title: 'Please answer the question',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const results = await analyzeSkinQuiz(answers);
      onAnalysisComplete(results);
      toast({
        title: 'Analysis complete!',
        description: 'Your skin profile has been created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error analyzing skin',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (currentStep >= questions.length) {
      return (
        <Box textAlign="center" p={5}>
          <Heading size="md" mb={4}>Thank you for completing the assessment!</Heading>
          <Text mb={6}>Click submit to generate your personalized skin profile and recommendations.</Text>
          <Button 
            colorScheme="teal" 
            isLoading={isSubmitting} 
            onClick={handleSubmit}
            size="lg"
          >
            Submit
          </Button>
        </Box>
      );
    }

    const question = questions[currentStep];
    
    return (
      <Box>
        <Heading size="md" mb={4}>{question.question}</Heading>
        
        {question.type === 'radio' && (
          <RadioGroup 
            onChange={(value) => handleAnswerChange(question.id, value)} 
            value={answers[question.id] || ''}
          >
            <VStack align="start" spacing={3}>
              {question.options.map(option => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        )}
        
        {question.type === 'checkbox' && (
          <CheckboxGroup 
            onChange={(value) => handleAnswerChange(question.id, value)} 
            value={answers[question.id] || []}
          >
            <VStack align="start" spacing={3}>
              {question.options.map(option => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        )}
      </Box>
    );
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={6} 
      boxShadow="md" 
      bg="white"
      maxW="800px"
      mx="auto"
    >
      <Flex direction={{ base: 'column', md: 'row' }} mb={6}>
        <Box flex="1" pr={{ md: 6 }}>
          <Heading size="lg" mb={2}>Skin Analysis Quiz</Heading>
          <Text color="gray.600" mb={4}>
            Answer these questions to get personalized skincare recommendations.
          </Text>
          <Progress 
            value={(currentStep / questions.length) * 100} 
            size="sm" 
            colorScheme="teal" 
            borderRadius="full"
            mb={6}
          />
        </Box>
        <Box w={{ base: "100%", md: "200px" }} mb={{ base: 4, md: 0 }}>
          <Image 
            src="/images/skin-analysis.png" 
            alt="Skin Analysis" 
            borderRadius="md"
            fallbackSrc="https://via.placeholder.com/200x150?text=Skin+Analysis"
          />
        </Box>
      </Flex>
      
      <Divider mb={6} />
      
      <Box minH="300px">
        {renderQuestion()}
      </Box>
      
      <Flex justify="space-between" mt={8}>
        <Button 
          onClick={handlePrevious} 
          isDisabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>
        
        {currentStep < questions.length && (
          <Button 
            onClick={handleNext} 
            colorScheme="teal"
          >
            Next
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default QuizAssessment;
