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
  Flex,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
  Divider,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaInfoCircle, FaArrowRight, FaSave, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import MorningRoutine from '../components/RoutineBuilder/MorningRoutine';
import EveningRoutine from '../components/RoutineBuilder/EveningRoutine';
import { getUserRoutine, saveUserRoutine, getRecommendations } from '../services/api';
import { isAuthenticated } from '../services/authService';

const RoutinePlanner = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [routine, setRoutine] = useState({
    morning: {},
    evening: {}
  });
  const [recommendedProducts, setRecommendedProducts] = useState({
    morning: {},
    evening: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = isAuthenticated();
    setIsUserAuthenticated(authStatus);
    
    // Load routine from localStorage first (for faster initial load)
    const savedRoutine = localStorage.getItem('skincare_routine');
    if (savedRoutine) {
      try {
        setRoutine(JSON.parse(savedRoutine));
      } catch (error) {
        console.error('Error parsing saved routine:', error);
      }
    }
    
    // Check if there's a selected product from recommendations
    const selectedProduct = localStorage.getItem('selected_product');
    if (selectedProduct) {
      try {
        const product = JSON.parse(selectedProduct);
        handleAddSelectedProduct(product);
        localStorage.removeItem('selected_product');
      } catch (error) {
        console.error('Error parsing selected product:', error);
      }
    }
    
    // If authenticated, fetch routine from server
    if (authStatus) {
      fetchUserRoutine();
    } else {
      // Still need to fetch recommended products
      fetchRecommendedProducts();
    }
  }, []);

  const fetchUserRoutine = async () => {
    setIsLoading(true);
    try {
      const data = await getUserRoutine();
      
      // Merge with local data, with server data taking precedence
      const mergedRoutine = {
        morning: { ...routine.morning, ...data.morning },
        evening: { ...routine.evening, ...data.evening }
      };
      
      setRoutine(mergedRoutine);
      localStorage.setItem('skincare_routine', JSON.stringify(mergedRoutine));
      
      // Also fetch recommended products
      fetchRecommendedProducts();
    } catch (error) {
      console.error('Error fetching user routine:', error);
      toast({
        title: 'Error loading routine',
        description: 'Could not load your saved routine. Using local data instead.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Still fetch recommended products
      fetchRecommendedProducts();
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      // Get skin analysis results from localStorage
      const savedResults = localStorage.getItem('skinAnalysisResults');
      let skinProfile = {};
      
      if (savedResults) {
        try {
          skinProfile = JSON.parse(savedResults);
        } catch (error) {
          console.error('Error parsing saved analysis results:', error);
        }
      }
      
      // Fetch recommendations for each product type
      const productTypes = [
        'cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 
        'eye_cream', 'exfoliator', 'treatment', 'mask', 'face_oil',
        'night_cream', 'makeup_remover'
      ];
      
      const recommendations = {};
      
      // For efficiency, we'll make a single API call and then organize the results
      const data = await getRecommendations({
        ...skinProfile,
        limit: 100 // Get a larger set to ensure we have options for each category
      });
      
      // Organize products by type
      productTypes.forEach(type => {
        recommendations[type] = data.products.filter(p => 
          p.productType.toLowerCase() === type.replace('_', ' ')
        ).slice(0, 5); // Limit to 5 options per type
      });
      
      setRecommendedProducts({
        morning: recommendations,
        evening: recommendations
      });
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      toast({
        title: 'Error loading recommendations',
        description: 'Could not load product recommendations.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSelectedProduct = (product) => {
    // Determine which routine (morning/evening) and step this product belongs to
    const productType = product.productType.toLowerCase().replace(' ', '_');
    
    // Default to morning routine for most products
    let timeOfDay = 'morning';
    
    // Some products are more appropriate for evening routine
    if (['night_cream', 'treatment', 'face_oil', 'exfoliator'].includes(productType)) {
      timeOfDay = 'evening';
      setTabIndex(1); // Switch to evening tab
    }
    
    // Update the routine
    const updatedRoutine = {
      ...routine,
      [timeOfDay]: {
        ...routine[timeOfDay],
        [productType]: product
      }
    };
    
    setRoutine(updatedRoutine);
    localStorage.setItem('skincare_routine', JSON.stringify(updatedRoutine));
    
    toast({
      title: 'Product added',
      description: `${product.name} has been added to your ${timeOfDay} routine.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateRoutine = (timeOfDay, updatedRoutineSection) => {
    const updatedRoutine = {
      ...routine,
      [timeOfDay]: updatedRoutineSection
    };
    
    setRoutine(updatedRoutine);
    localStorage.setItem('skincare_routine', JSON.stringify(updatedRoutine));
  };

  const handleSaveRoutine = async () => {
    if (!isUserAuthenticated) {
      onOpen();
      return;
    }
    
    setIsSaving(true);
    try {
      await saveUserRoutine(routine);
      toast({
        title: 'Routine saved',
        description: 'Your skincare routine has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving routine:', error);
      toast({
        title: 'Error saving routine',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearRoutine = () => {
    const newRoutine = {
      morning: {},
      evening: {}
    };
    
    setRoutine(newRoutine);
    localStorage.setItem('skincare_routine', JSON.stringify(newRoutine));
    
    toast({
      title: 'Routine cleared',
      description: 'Your skincare routine has been reset.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleTabChange = (index) => {
    setTabIndex(index);
  };

  const handleLogin = () => {
    // Store current routine in localStorage before redirecting
    localStorage.setItem('skincare_routine', JSON.stringify(routine));
    navigate('/login', { state: { returnPath: '/routine-planner' } });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex 
          justify="space-between" 
          align={{ base: "start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Skincare Routine Planner
            </Heading>
            <Text color="gray.600">
              Build and customize your perfect morning and evening routines
            </Text>
          </Box>
          
          <HStack>
            <Button
              leftIcon={<FaTrashAlt />}
              colorScheme="red"
              variant="outline"
              onClick={handleClearRoutine}
              size="sm"
            >
              Clear Routine
            </Button>
            <Button
              leftIcon={<FaSave />}
              colorScheme="teal"
              onClick={handleSaveRoutine}
              isLoading={isSaving}
              loadingText="Saving..."
              size="sm"
            >
              Save Routine
            </Button>
          </HStack>
        </Flex>
      </Box>
      
      {!localStorage.getItem('skinAnalysisResults') && (
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>No Skin Analysis Found</AlertTitle>
            <AlertDescription>
              Complete a skin analysis to get personalized product recommendations for your routine.
            </AlertDescription>
          </Box>
          <Button 
            ml="auto" 
            colorScheme="teal" 
            onClick={() => navigate('/analysis')}
            rightIcon={<FaArrowRight />}
            size="sm"
          >
            Start Analysis
          </Button>
        </Alert>
      )}
      
      <Tabs 
        isFitted 
        variant="enclosed" 
        colorScheme="teal" 
        index={tabIndex} 
        onChange={handleTabChange}
      >
        <TabList mb="1em">
          <Tab>
            <Icon as={FaSun} mr={2} />
            Morning Routine
          </Tab>
          <Tab>
            <Icon as={FaMoon} mr={2} />
            Evening Routine
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <MorningRoutine
              routine={routine.morning}
              recommendedProducts={recommendedProducts.morning}
              onUpdateRoutine={handleUpdateRoutine}
              isLoading={isLoading}
            />
          </TabPanel>
          <TabPanel px={0}>
            <EveningRoutine
              routine={routine.evening}
              recommendedProducts={recommendedProducts.evening}
              onUpdateRoutine={handleUpdateRoutine}
              isLoading={isLoading}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Box mt={10} p={6} borderWidth="1px" borderRadius="lg" bg="blue.50">
        <Flex align="center" mb={3}>
          <Icon as={FaInfoCircle} color="blue.500" mr={2} boxSize={5} />
          <Heading size="md" color="blue.700">Tips for an Effective Routine</Heading>
        </Flex>
        
        <Text mb={4}>
          For best results, follow these guidelines when building your skincare routine:
        </Text>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Box>
            <Text fontWeight="bold" mb={1}>Morning Routine Order:</Text>
            <Text fontSize="sm">
              1. Cleanser<br />
              2. Toner (optional)<br />
              3. Serum<br />
              4. Eye Cream (optional)<br />
              5. Moisturizer<br />
              6. Sunscreen (essential)
            </Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold" mb={1}>Evening Routine Order:</Text>
            <Text fontSize="sm">
              1. Makeup Remover (if needed)<br />
              2. Cleanser<br />
              3. Exfoliator (1-3 times weekly)<br />
              4. Toner (optional)<br />
              5. Treatment/Serum<br />
              6. Eye Cream (optional)<br />
              7. Moisturizer/Night Cream
            </Text>
          </Box>
        </SimpleGrid>
        
        <Divider my={4} />
        
        <Text fontSize="sm" color="blue.700">
          Remember to wait 1-2 minutes between applying each product to allow it to absorb properly.
          Introduce new products one at a time to monitor how your skin reacts.
        </Text>
      </Box>
      
      {/* Login Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create an Account or Log In</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="info" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Save your routine</AlertTitle>
                <AlertDescription>
                  Create an account or log in to save your skincare routine and access it from any device.
                </AlertDescription>
              </Box>
            </Alert>
            <Text mb={4}>
              Your routine will be saved to your account, allowing you to:
            </Text>
            <Box pl={4} mb={4}>
              <Text>• Access your routine from any device</Text>
              <Text>• Track your progress over time</Text>
              <Text>• Get personalized recommendations</Text>
              <Text>• Receive updates when better products are found</Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Later
            </Button>
            <Button colorScheme="teal" onClick={handleLogin}>
              Log In / Sign Up
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default RoutinePlanner;
