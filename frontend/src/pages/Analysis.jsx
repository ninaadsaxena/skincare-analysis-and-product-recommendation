import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Icon,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from '@chakra-ui/react';
import { FaInfoCircle, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import QuizAssessment from '../components/SkinAnalysis/QuizAssessment';
import ImageUploader from '../components/SkinAnalysis/ImageUploader';
import AnalysisResults from '../components/SkinAnalysis/AnalysisResults';
import { isAuthenticated } from '../services/authService';

const Analysis = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisMethod, setAnalysisMethod] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Check if user is authenticated
    setIsUserAuthenticated(isAuthenticated());
    
    // Check if there are saved results in localStorage
    const savedResults = localStorage.getItem('skinAnalysisResults');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setAnalysisResults(parsedResults);
        setAnalysisMethod(parsedResults.analysisMethod);
      } catch (error) {
        console.error('Error parsing saved analysis results:', error);
      }
    }
  }, []);

  const handleAnalysisComplete = (results) => {
    // Add the analysis method to the results
    const resultsWithMethod = {
      ...results,
      analysisMethod: analysisMethod || 'quiz' // Default to quiz if not set
    };
    
    setAnalysisResults(resultsWithMethod);
    
    // Save to localStorage for persistence
    localStorage.setItem('skinAnalysisResults', JSON.stringify(resultsWithMethod));
    
    // Show success toast
    toast({
      title: 'Analysis Complete',
      description: 'Your skin analysis has been completed successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleResetAnalysis = () => {
    setAnalysisResults(null);
    localStorage.removeItem('skinAnalysisResults');
    onClose();
  };

  const handleViewRecommendations = () => {
    navigate('/recommendations');
  };

  const handleTabChange = (index) => {
    setAnalysisMethod(index === 0 ? 'quiz' : 'image');
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {!analysisResults ? (
          <>
            <Box textAlign="center" mb={6}>
              <Heading as="h1" size="xl" mb={3}>
                Skin Analysis
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="800px" mx="auto">
                Discover your skin type, concerns, and get personalized recommendations
              </Text>
            </Box>

            {!isUserAuthenticated && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Create an account to save your results</AlertTitle>
                  <AlertDescription>
                    While you can complete the analysis as a guest, creating an account allows you to save your results and track your progress over time.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            <Tabs isFitted variant="enclosed" onChange={handleTabChange}>
              <TabList mb="1em">
                <Tab>Quiz Assessment</Tab>
                <Tab>Image Analysis</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <QuizAssessment onAnalysisComplete={handleAnalysisComplete} />
                </TabPanel>
                <TabPanel>
                  <ImageUploader onAnalysisComplete={handleAnalysisComplete} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        ) : (
          <Box>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h1" size="xl">
                Your Skin Analysis Results
              </Heading>
              <Button colorScheme="red" variant="outline" onClick={onOpen} size="sm">
                Reset Analysis
              </Button>
            </Flex>

            <AnalysisResults 
              results={analysisResults} 
              onViewRecommendations={handleViewRecommendations} 
            />

            <Divider my={8} />

            <Box textAlign="center">
              <Heading size="md" mb={4}>
                Ready to find the perfect products for your skin?
              </Heading>
              <Button
                size="lg"
                colorScheme="teal"
                rightIcon={<FaArrowRight />}
                onClick={handleViewRecommendations}
              >
                View Personalized Recommendations
              </Button>
            </Box>
          </Box>
        )}
      </VStack>

      {/* Confirmation Modal for Reset */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset Skin Analysis</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Are you sure?</AlertTitle>
                <AlertDescription>
                  This will delete your current skin analysis results and you'll need to complete the analysis again.
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleResetAnalysis}>
              Reset Analysis
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Analysis;
