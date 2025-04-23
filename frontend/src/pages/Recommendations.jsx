import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Icon,
  Select,
  HStack,
  Badge,
  Divider,
  useBreakpointValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { FaSyncAlt, FaFilter, FaSortAmountDown, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/Recommendations/ProductCard';
import FilterOptions from '../components/Recommendations/FilterOptions';
import { getRecommendations } from '../services/api';

const Recommendations = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [routine, setRoutine] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('match');
  const [filters, setFilters] = useState({
    productTypes: [],
    concerns: [],
    skinTypes: [],
    brands: [],
    ingredients: [],
    minPrice: 0,
    maxPrice: 200,
    additionalFilters: []
  });
  
  // Fetch recommendations based on filters
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
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
      
      // Combine skin profile with filters
      const requestData = {
        ...filters,
        skinType: skinProfile.skinType || '',
        skinConcerns: skinProfile.skinConcerns || [],
        ...skinProfile
      };
      
      const data = await getRecommendations(requestData);
      
      // Sort products based on selected option
      let sortedProducts = [...data.products];
      
      if (sortOption === 'match') {
        sortedProducts.sort((a, b) => b.matchScore - a.matchScore);
      } else if (sortOption === 'price_low') {
        sortedProducts.sort((a, b) => a.price - b.price);
      } else if (sortOption === 'price_high') {
        sortedProducts.sort((a, b) => b.price - a.price);
      } else if (sortOption === 'rating') {
        sortedProducts.sort((a, b) => b.rating - a.rating);
      }
      
      setProducts(sortedProducts);
      
      // Load wishlist and routine from localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (error) {
          console.error('Error parsing saved wishlist:', error);
        }
      }
      
      const savedRoutine = localStorage.getItem('skincare_routine');
      if (savedRoutine) {
        try {
          setRoutine(JSON.parse(savedRoutine));
        } catch (error) {
          console.error('Error parsing saved routine:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortOption]);
  
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      productTypes: [],
      concerns: [],
      skinTypes: [],
      brands: [],
      ingredients: [],
      minPrice: 0,
      maxPrice: 200,
      additionalFilters: []
    });
    
    toast({
      title: 'Filters reset',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const handleAddToWishlist = (product, isAdding) => {
    if (isAdding) {
      const newWishlist = [...wishlist, product];
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    } else {
      const newWishlist = wishlist.filter(item => item.id !== product.id);
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
  };
  
  const handleAddToRoutine = (product) => {
    // Navigate to routine planner with the selected product
    localStorage.setItem('selected_product', JSON.stringify(product));
    navigate('/routine-planner');
  };
  
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };
  
  const isInRoutine = (productId) => {
    // Check if product is in morning or evening routine
    const morningRoutine = routine.morning || {};
    const eveningRoutine = routine.evening || {};
    
    return Object.values(morningRoutine).some(product => product?.id === productId) ||
           Object.values(eveningRoutine).some(product => product?.id === productId);
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Personalized Recommendations
        </Heading>
        <Text color="gray.600">
          Products selected based on your skin analysis and preferences
        </Text>
      </Box>
      
      {error ? (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
          <Button ml="auto" onClick={fetchRecommendations} leftIcon={<FaSyncAlt />} size="sm">
            Retry
          </Button>
        </Alert>
      ) : !localStorage.getItem('skinAnalysisResults') ? (
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>No Skin Analysis Found</AlertTitle>
            <AlertDescription>
              Complete a skin analysis to get personalized product recommendations.
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
      ) : null}
      
      <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
        {/* Filters - Desktop */}
        {!isMobile && (
          <Box w="300px" flexShrink={0}>
            <FilterOptions
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              isLoading={isLoading}
            />
          </Box>
        )}
        
        {/* Mobile Filter Button */}
        {isMobile && (
          <Button 
            leftIcon={<FaFilter />} 
            onClick={onOpen} 
            mb={4}
            colorScheme="teal"
            variant="outline"
          >
            Filters
          </Button>
        )}
        
        {/* Products Grid */}
        <Box flex="1">
          <Flex 
            justify="space-between" 
            align="center" 
            mb={6}
            direction={{ base: 'column', sm: 'row' }}
            gap={4}
          >
            <HStack>
              <Text fontWeight="medium">Sort by:</Text>
              <Select 
                value={sortOption} 
                onChange={handleSortChange} 
                w="200px"
                size="sm"
              >
                <option value="match">Best Match</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </Select>
            </HStack>
            
            <HStack>
              <Text fontSize="sm" color="gray.600">
                {products.length} products found
              </Text>
              <Button
                leftIcon={<FaSyncAlt />}
                onClick={fetchRecommendations}
                size="sm"
                variant="ghost"
                isLoading={isLoading}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>
          
          {isLoading ? (
            <Flex justify="center" align="center" direction="column" py={10}>
              <Spinner size="xl" color="teal.500" mb={4} />
              <Text>Finding the perfect products for your skin...</Text>
            </Flex>
          ) : products.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>No products found</AlertTitle>
                <AlertDescription>
                  Try adjusting your filters to see more products.
                </AlertDescription>
              </Box>
              <Button ml="auto" onClick={handleResetFilters} size="sm">
                Reset Filters
              </Button>
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToRoutine={handleAddToRoutine}
                  onAddToWishlist={handleAddToWishlist}
                  isInWishlist={isInWishlist(product.id)}
                  isInRoutine={isInRoutine(product.id)}
                  matchScore={product.matchScore}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Flex>
      
      {/* Mobile Filters Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filter Products</DrawerHeader>
          <DrawerBody>
            <FilterOptions
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              isLoading={isLoading}
              isMobile={true}
            />
            <Button mt={6} w="100%" onClick={onClose} colorScheme="teal">
              Apply Filters
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default Recommendations;
