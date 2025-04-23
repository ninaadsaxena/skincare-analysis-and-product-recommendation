import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  useToast,
  Flex,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Skeleton,
  useDisclosure,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { 
  FaSun, 
  FaSave, 
  FaInfoCircle, 
  FaPlus, 
  FaChevronDown, 
  FaChevronUp 
} from 'react-icons/fa';
import RoutineStep from './RoutineStep';
import { saveUserRoutine } from '../../services/api';

const MorningRoutine = ({ 
  routine = {}, 
  recommendedProducts = {}, 
  onUpdateRoutine, 
  isLoading = false 
}) => {
  const toast = useToast();
  const { isOpen: isInfoOpen, onToggle: onInfoToggle } = useDisclosure({ defaultIsOpen: true });
  const [isSaving, setIsSaving] = useState(false);
  
  // Define the morning routine steps in order
  const routineSteps = [
    {
      name: 'cleanser',
      description: 'Removes dirt, oil, and impurities from your skin',
      isEssential: true,
      order: 1
    },
    {
      name: 'toner',
      description: 'Balances skin pH and prepares skin for treatments',
      isEssential: false,
      order: 2
    },
    {
      name: 'serum',
      description: 'Targeted treatment with concentrated active ingredients',
      isEssential: false,
      order: 3
    },
    {
      name: 'eye_cream',
      description: 'Hydrates and treats the delicate eye area',
      isEssential: false,
      order: 4
    },
    {
      name: 'moisturizer',
      description: 'Hydrates and locks in moisture',
      isEssential: true,
      order: 5
    },
    {
      name: 'sunscreen',
      description: 'Protects skin from UV damage',
      isEssential: true,
      order: 6
    }
  ];

  const handleRemoveProduct = (stepName) => {
    const updatedRoutine = { ...routine };
    delete updatedRoutine[stepName];
    onUpdateRoutine('morning', updatedRoutine);
  };

  const handleReplaceProduct = (stepName, timeOfDay, newProduct) => {
    const updatedRoutine = { 
      ...routine,
      [stepName]: newProduct
    };
    onUpdateRoutine('morning', updatedRoutine);
  };

  const handleSaveRoutine = async () => {
    setIsSaving(true);
    try {
      await saveUserRoutine({ morning: routine });
      toast({
        title: "Routine saved",
        description: "Your morning routine has been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error saving routine",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if essential products are missing
  const missingEssentials = routineSteps
    .filter(step => step.isEssential && !routine[step.name])
    .map(step => step.name);

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={5} 
      bg="white" 
      boxShadow="md"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Flex align="center">
          <Icon as={FaSun} color="orange.400" mr={2} boxSize={5} />
          <Heading size="md">Morning Routine</Heading>
        </Flex>
        
        <Button
          leftIcon={<FaSave />}
          colorScheme="teal"
          size="sm"
          onClick={handleSaveRoutine}
          isLoading={isSaving}
          isDisabled={missingEssentials.length > 0}
        >
          Save Routine
        </Button>
      </Flex>
      
      <Collapse in={isInfoOpen} animateOpacity>
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">Morning Routine Tips</AlertTitle>
            <AlertDescription fontSize="xs">
              Your morning routine should focus on protection and prevention. 
              Always finish with sunscreen, even on cloudy days.
            </AlertDescription>
          </Box>
          <IconButton
            icon={<FaChevronUp />}
            onClick={onInfoToggle}
            variant="ghost"
            size="sm"
            aria-label="Hide info"
          />
        </Alert>
      </Collapse>
      
      {!isInfoOpen && (
        <Button 
          leftIcon={<FaChevronDown />} 
          variant="ghost" 
          size="xs" 
          mb={4}
          onClick={onInfoToggle}
        >
          Show tips
        </Button>
      )}
      
      {missingEssentials.length > 0 && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Missing essential products</AlertTitle>
            <AlertDescription fontSize="xs">
              Your routine is missing: {missingEssentials.map(item => 
                item.replace(/_/g, ' ')).join(', ')}
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      {isLoading ? (
        <VStack spacing={4} align="stretch">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="100px" borderRadius="lg" />
          ))}
        </VStack>
      ) : (
        <VStack spacing={0} align="stretch">
          {routineSteps.map((step) => (
            <RoutineStep
              key={step.name}
              stepName={step.name}
              stepDescription={step.description}
              product={routine[step.name]}
              isEssential={step.isEssential}
              onRemoveProduct={handleRemoveProduct}
              onReplaceProduct={handleReplaceProduct}
              timeOfDay="morning"
              stepOrder={step.order}
              alternativeProducts={recommendedProducts[step.name] || []}
            />
          ))}
        </VStack>
      )}
      
      <Flex justify="center" mt={6}>
        <Button
          leftIcon={<FaPlus />}
          variant="outline"
          colorScheme="teal"
          size="sm"
          isDisabled={true} // Enable when custom steps are implemented
        >
          Add Custom Step
        </Button>
      </Flex>
    </Box>
  );
};

export default MorningRoutine;
