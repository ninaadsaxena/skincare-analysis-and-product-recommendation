import React, { useState } from 'react';
import {
  Box,
  Image,
  Badge,
  Text,
  Flex,
  Button,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  HStack,
  VStack,
  Divider,
  Heading,
  Tag,
  useToast,
  Icon,
  List,
  ListItem,
  ListIcon,
  Progress,
  SimpleGrid,
  Collapse,
} from '@chakra-ui/react';
import { 
  FaHeart, 
  FaRegHeart, 
  FaShoppingCart, 
  FaInfoCircle, 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { submitProductFeedback } from '../../services/api';

const ProductCard = ({ 
  product, 
  onAddToRoutine, 
  onAddToWishlist, 
  isInWishlist = false,
  isInRoutine = false,
  matchScore = null,
  showMatchScore = true
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);
  const [showIngredients, setShowIngredients] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const {
    id,
    name,
    brand,
    price,
    imageUrl,
    rating: productRating,
    reviewCount,
    description,
    size,
    ingredients,
    benefits,
    suitableFor,
    howToUse,
    keyIngredients,
    concerns,
    productType
  } = product;

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist(product, !isWishlisted);
    
    toast({
      title: !isWishlisted ? 'Added to wishlist' : 'Removed from wishlist',
      status: !isWishlisted ? 'success' : 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleAddToRoutine = () => {
    onAddToRoutine(product);
    
    toast({
      title: 'Added to routine',
      description: `${name} has been added to your routine`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating before submitting',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmittingFeedback(true);
    try {
      await submitProductFeedback(id, rating, feedbackText);
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setRating(0);
      setFeedbackText('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error submitting feedback',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Icon key={i} as={FaStar} color="yellow.400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Icon key={i} as={FaStarHalfAlt} color="yellow.400" />);
      } else {
        stars.push(<Icon key={i} as={FaRegStar} color="yellow.400" />);
      }
    }
    
    return stars;
  };

  // Interactive rating component
  const RatingSelector = ({ currentRating, onChange }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    return (
      <HStack spacing={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={star <= (hoverRating || currentRating) ? FaStar : FaRegStar}
            color="yellow.400"
            cursor="pointer"
            boxSize={6}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </HStack>
    );
  };

  return (
    <>
      <Box
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        bg="white"
        transition="transform 0.3s, box-shadow 0.3s"
        _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
        position="relative"
      >
        {showMatchScore && matchScore !== null && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            px={2}
            py={1}
            borderRadius="full"
            colorScheme={matchScore > 80 ? "green" : matchScore > 60 ? "blue" : "yellow"}
            fontSize="sm"
            fontWeight="bold"
          >
            {matchScore}% Match
          </Badge>
        )}
        
        <Box position="relative" height="200px">
          <Image
            src={imageUrl || `https://via.placeholder.com/300x200?text=${name}`}
            alt={name}
            objectFit="cover"
            w="100%"
            h="100%"
          />
          <IconButton
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            icon={isWishlisted ? <FaHeart /> : <FaRegHeart />}
            position="absolute"
            top={2}
            left={2}
            colorScheme={isWishlisted ? "red" : "gray"}
            variant="solid"
            size="sm"
            onClick={handleAddToWishlist}
          />
        </Box>

        <Box p={4}>
          <Text color="gray.500" fontSize="sm" fontWeight="semibold">
            {brand}
          </Text>
          
          <Heading as="h3" size="md" mt={1} noOfLines={2} height="50px">
            {name}
          </Heading>
          
          <HStack mt={2} spacing={1}>
            {renderStars(productRating)}
            <Text fontSize="sm" color="gray.600">
              ({reviewCount})
            </Text>
          </HStack>
          
          <Flex mt={2} justify="space-between" align="center">
            <HStack>
              <Badge colorScheme="purple">{productType}</Badge>
              {concerns && concerns.length > 0 && (
                <Badge colorScheme="teal">{concerns[0]}</Badge>
              )}
            </HStack>
            <Text fontWeight="bold" fontSize="lg">
              ${price.toFixed(2)}
            </Text>
          </Flex>
          
          <Text mt={2} fontSize="sm" color="gray.600" noOfLines={2}>
            {description}
          </Text>
          
          <Divider my={3} />
          
          <Flex justify="space-between" mt={2}>
            <Button
              leftIcon={<FaInfoCircle />}
              variant="outline"
              size="sm"
              onClick={onOpen}
            >
              Details
            </Button>
            
            <Button
              leftIcon={<FaShoppingCart />}
              colorScheme="teal"
              size="sm"
              onClick={handleAddToRoutine}
              isDisabled={isInRoutine}
            >
              {isInRoutine ? 'In Routine' : 'Add to Routine'}
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Product Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex direction="column">
              <Text>{name}</Text>
              <Text fontSize="sm" fontWeight="normal" color="gray.600">{brand}</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
              <Box w={{ base: '100%', md: '40%' }}>
                <Image
                  src={imageUrl || `https://via.placeholder.com/300x300?text=${name}`}
                  alt={name}
                  borderRadius="md"
                  objectFit="cover"
                />
                
                <VStack align="stretch" mt={4} spacing={2}>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Price:</Text>
                    <Text>${price.toFixed(2)}</Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Size:</Text>
                    <Text>{size}</Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Rating:</Text>
                    <Flex align="center">
                      {renderStars(productRating)}
                      <Text ml={1}>({reviewCount})</Text>
                    </Flex>
                  </Flex>
                </VStack>
                
                <HStack mt={4} flexWrap="wrap">
                  <Badge colorScheme="purple">{productType}</Badge>
                  {suitableFor && suitableFor.map((type, index) => (
                    <Badge key={index} colorScheme="blue">{type}</Badge>
                  ))}
                  {concerns && concerns.map((concern, index) => (
                    <Badge key={index} colorScheme="teal">{concern}</Badge>
                  ))}
                </HStack>
              </Box>
              
              <VStack align="stretch" flex="1" spacing={4}>
                <Box>
                  <Heading size="sm" mb={2}>Description</Heading>
                  <Text fontSize="sm">{description}</Text>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>Key Benefits</Heading>
                  <List spacing={1}>
                    {benefits && benefits.map((benefit, index) => (
                      <ListItem key={index} fontSize="sm">
                        <ListIcon as={FaCheck} color="green.500" />
                        {benefit}
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>How to Use</Heading>
                  <Text fontSize="sm">{howToUse}</Text>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>Key Ingredients</Heading>
                  <SimpleGrid columns={2} spacing={2}>
                    {keyIngredients && keyIngredients.map((ingredient, index) => (
                      <Tag key={index} size="md" variant="subtle" colorScheme="blue">
                        {ingredient}
                      </Tag>
                    ))}
                  </SimpleGrid>
                </Box>
                
                <Box>
                  <Button 
                    rightIcon={showIngredients ? <FaChevronUp /> : <FaChevronDown />}
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIngredients(!showIngredients)}
                    width="100%"
                  >
                    {showIngredients ? "Hide Full Ingredients" : "Show Full Ingredients"}
                  </Button>
                  
                  <Collapse in={showIngredients} animateOpacity>
                    <Box mt={2} p={3} bg="gray.50" borderRadius="md" fontSize="xs">
                      {ingredients}
                    </Box>
                  </Collapse>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={3}>Rate This Product</Heading>
                  <VStack align="stretch" spacing={3}>
                    <RatingSelector currentRating={rating} onChange={handleRatingChange} />
                    
                    <textarea
                      placeholder="Share your experience with this product (optional)"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #E2E8F0',
                        minHeight: '80px'
                      }}
                    />
                    
                    <Button 
                      colorScheme="blue" 
                      size="sm" 
                      onClick={handleSubmitFeedback}
                      isLoading={isSubmittingFeedback}
                    >
                      Submit Feedback
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button 
              colorScheme="teal" 
              leftIcon={<FaShoppingCart />}
              onClick={() => {
                handleAddToRoutine();
                onClose();
              }}
              isDisabled={isInRoutine}
            >
              {isInRoutine ? 'Already In Routine' : 'Add to Routine'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductCard;
