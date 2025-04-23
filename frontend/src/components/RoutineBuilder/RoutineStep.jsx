import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  IconButton,
  Badge,
  useDisclosure,
  Collapse,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useToast,
  Icon,
  VStack,
  HStack,
} from '@chakra-ui/react';
import {
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaTrashAlt,
  FaExchangeAlt,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';

const RoutineStep = ({
  stepName,
  stepDescription,
  product,
  isEssential,
  onRemoveProduct,
  onReplaceProduct,
  timeOfDay,
  stepOrder,
  alternativeProducts = [],
}) => {
  const toast = useToast();
  const { isOpen, onToggle } = useDisclosure();
  const { 
    isOpen: isModalOpen, 
    onOpen: onModalOpen, 
    onClose: onModalClose 
  } = useDisclosure();
  const [selectedAlternative, setSelectedAlternative] = useState(null);

  const handleRemove = () => {
    onRemoveProduct(stepName, timeOfDay);
    toast({
      title: "Product removed",
      description: `${product.name} has been removed from your ${timeOfDay} routine.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSelectAlternative = (alternativeProduct) => {
    setSelectedAlternative(alternativeProduct);
  };

  const handleReplaceConfirm = () => {
    if (selectedAlternative) {
      onReplaceProduct(stepName, timeOfDay, selectedAlternative);
      toast({
        title: "Product replaced",
        description: `${product.name} has been replaced with ${selectedAlternative.name}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onModalClose();
      setSelectedAlternative(null);
    }
  };

  // Format step name for display
  const formatStepName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  };

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        mb={4}
        bg="white"
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ boxShadow: "md" }}
      >
        <Flex 
          p={4} 
          justify="space-between" 
          align="center"
          borderBottomWidth={isOpen ? "1px" : "0"}
          borderBottomColor="gray.200"
        >
          <Flex align="center">
            <Box 
              bg={isEssential ? "teal.500" : "gray.200"} 
              color={isEssential ? "white" : "gray.700"}
              borderRadius="full" 
              w="28px" 
              h="28px" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              mr={3}
              fontSize="sm"
              fontWeight="bold"
            >
              {stepOrder}
            </Box>
            
            <Box>
              <Flex align="center">
                <Text fontWeight="bold" fontSize="md">
                  {formatStepName(stepName)}
                </Text>
                {isEssential && (
                  <Badge colorScheme="teal" ml={2} fontSize="xs">
                    Essential
                  </Badge>
                )}
              </Flex>
              <Text fontSize="xs" color="gray.500">
                {stepDescription}
              </Text>
            </Box>
          </Flex>
          
          <Flex align="center">
            {product ? (
              <HStack spacing={2}>
                <IconButton
                  icon={<FaExchangeAlt />}
                  aria-label="Replace product"
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={onModalOpen}
                />
                <IconButton
                  icon={<FaTrashAlt />}
                  aria-label="Remove product"
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={handleRemove}
                />
                <IconButton
                  icon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  aria-label={isOpen ? "Collapse" : "Expand"}
                  size="sm"
                  variant="ghost"
                  onClick={onToggle}
                />
              </HStack>
            ) : (
              <Button
                size="sm"
                colorScheme={isEssential ? "teal" : "gray"}
                variant={isEssential ? "solid" : "outline"}
                onClick={onModalOpen}
              >
                {isEssential ? "Add Essential Product" : "Add Product"}
              </Button>
            )}
          </Flex>
        </Flex>
        
        {product && (
          <Collapse in={isOpen} animateOpacity>
            <Box p={4}>
              <Flex direction={{ base: "column", sm: "row" }} align="center">
                <Image
                  src={product.imageUrl || `https://via.placeholder.com/100x100?text=${product.name}`}
                  alt={product.name}
                  boxSize="100px"
                  objectFit="cover"
                  borderRadius="md"
                  mr={{ base: 0, sm: 4 }}
                  mb={{ base: 4, sm: 0 }}
                />
                
                <Box flex="1">
                  <Flex justify="space-between" align="start">
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        {product.brand}
                      </Text>
                      <Text fontWeight="bold" fontSize="lg">
                        {product.name}
                      </Text>
                    </Box>
                    <Badge colorScheme="purple">
                      {product.productType}
                    </Badge>
                  </Flex>
                  
                  <Text fontSize="sm" mt={2} noOfLines={2}>
                    {product.description}
                  </Text>
                  
                  <Flex mt={3} wrap="wrap" gap={2}>
                    {product.keyIngredients && product.keyIngredients.slice(0, 3).map((ingredient, idx) => (
                      <Badge key={idx} colorScheme="blue" variant="subtle">
                        {ingredient}
                      </Badge>
                    ))}
                    {product.keyIngredients && product.keyIngredients.length > 3 && (
                      <Tooltip label={product.keyIngredients.slice(3).join(", ")}>
                        <Badge colorScheme="blue" variant="outline">
                          +{product.keyIngredients.length - 3} more
                        </Badge>
                      </Tooltip>
                    )}
                  </Flex>
                </Box>
              </Flex>
              
              {product.howToUse && (
                <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                  <Flex align="center" mb={1}>
                    <Icon as={FaInfoCircle} color="blue.500" mr={2} />
                    <Text fontWeight="medium" fontSize="sm">
                      How to Use
                    </Text>
                  </Flex>
                  <Text fontSize="sm">
                    {product.howToUse}
                  </Text>
                </Box>
              )}
            </Box>
          </Collapse>
        )}
      </Box>
      
      {/* Modal for adding/replacing product */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {product ? "Replace Product" : "Add Product"} - {formatStepName(stepName)}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {alternativeProducts.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {alternativeProducts.map((altProduct) => (
                  <Box
                    key={altProduct.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={selectedAlternative?.id === altProduct.id ? "teal.500" : "gray.200"}
                    cursor="pointer"
                    onClick={() => handleSelectAlternative(altProduct)}
                    bg={selectedAlternative?.id === altProduct.id ? "teal.50" : "white"}
                    transition="all 0.2s"
                    _hover={{ borderColor: "teal.300", bg: "teal.50" }}
                  >
                    <Flex align="center">
                      <Image
                        src={altProduct.imageUrl || `https://via.placeholder.com/60x60?text=${altProduct.name}`}
                        alt={altProduct.name}
                        boxSize="60px"
                        objectFit="cover"
                        borderRadius="md"
                        mr={3}
                      />
                      
                      <Box flex="1">
                        <Text fontSize="sm" color="gray.500">
                          {altProduct.brand}
                        </Text>
                        <Text fontWeight="bold">
                          {altProduct.name}
                        </Text>
                        <Flex mt={1} align="center">
                          <Badge colorScheme="purple" mr={2}>
                            {altProduct.productType}
                          </Badge>
                          <Text fontSize="sm" fontWeight="bold">
                            ${altProduct.price.toFixed(2)}
                          </Text>
                        </Flex>
                      </Box>
                      
                      {selectedAlternative?.id === altProduct.id && (
                        <Icon as={FaCheck} color="teal.500" boxSize={5} />
                      )}
                    </Flex>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                py={10}
                color="gray.500"
              >
                <Icon as={FaExclamationTriangle} boxSize={10} mb={4} />
                <Text fontWeight="medium">No alternative products available</Text>
                <Text fontSize="sm" mt={2} textAlign="center">
                  We couldn't find any suitable alternatives for this step. 
                  Please check the recommendations page to find products.
                </Text>
                <Button 
                  mt={6} 
                  colorScheme="teal" 
                  size="sm"
                  onClick={onModalClose}
                >
                  Browse Recommendations
                </Button>
              </Flex>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="teal" 
              isDisabled={!selectedAlternative}
              onClick={handleReplaceConfirm}
            >
              {product ? "Replace Product" : "Add to Routine"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RoutineStep;
