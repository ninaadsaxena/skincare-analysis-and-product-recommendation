import React, { useState } from 'react';
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
  FaMoon, 
  FaSave, 
  FaInfoCircle, 
  FaPlus, 
  FaChevronDown, 
  FaChevronUp 
} from 'react-icons/fa';
import RoutineStep from './RoutineStep';
import { saveUserRoutine } from '../../services/api';

const EveningRoutine = ({ 
  routine = {}, 
  recommendedProducts = {}, 
  onUpdateRoutine, 
  isLoading = false 
}) => {
  const toast = useToast();
  const { isOpen: isInfoOpen, onToggle: onInfoToggle } = useDisclosure({ defaultIsOpen: true });
  const [isSaving, setIsSaving] = useState(false);
  
  // Define the evening routine steps in order
  const routineSteps = [
    {
      name: 'makeup_remover',
      description: 'Removes makeup and sunscreen (if wearing)',
      isEssential: false,
      order: 1
    },
    {
      name: 'cleanser',
      description: 'Removes dirt, oil, and impurities from your skin',
      isEssential: true,
      order: 2
    },
    {
      name: 'exfoliator',
      description: 'Removes dead skin cells (use 1-3 times per week)',
      isEssential: false,
      order: 3
    },
    {
      name: 'toner',
      description: 'Balances skin pH and prepares skin for treatments',
      isEssential: false,
      order: 4
    },
    {
      name: 'treatment',
      description: 'Targeted treatment for specific skin concerns',
      isEssential: false,
      order: 5
    },
    {
      name: 'serum',
      description: 'Concentrated active ingredients for specific concerns',
      isEssential: false,
      order: 6
    },
    {
      name: 'eye_cream',
      description: 'Hydrates and treats the delicate eye area',
      isEssential: false,
      order: 7
    },
    {
      name: 'moisturizer',
      description: 'Hydrates and locks in moisture',
      isEssential: true,
      order: 8
    },
    {
      name: 'face_oil',
      description: 'Extra nourishment and hydration',
      isEssential: false,
      order: 9
    },
    {
      name: 'night_cream',
      description: 'Intensive overnight repair and hydration',
      isEssential: false,
      order: 10
    }
  ];

  const handleRemoveProduct = (stepName) => {
    const updatedRoutine = { ...routine };
    delete updatedRoutine[stepName];
    onUpdateRoutine('evening', updatedRoutine);
  };

  const handleReplaceProduct = (stepName, timeOfDay, newProduct) => {
    const updatedRoutine = { 
      ...routine,
      [stepName]: newProduct
    };
    onUpdateRoutine('evening', updatedRoutine);
  };

  const handleSaveRoutine = async () => {
    setIsSaving(true);
    try {
      await saveUserRoutine({ evening: routine });
      toast({
        title: "Routine saved",
        description: "Your evening routine has been saved successfully.",
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
          <Icon as={FaMoon} color="purple.400" mr={2} boxSize={5} />
          <Heading size="md">Evening Routine</Heading>
        </Flex>
        
        <Button
          leftIcon={<FaSave />}
          colorScheme="purple"
          size="sm"
          onClick={handleSaveRoutine}
          isLoading={isSaving}
          isDisabled={missingEssentials.length > 0}
        >
          Save Routine
        </Button>
      </Flex>
      
      <Collapse in={isInfoOpen} animateOpacity>
        <Alert status="info" mb={4} borderRadius="md" colorScheme="purple">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">Evening Routine Tips</AlertTitle>
            <AlertDescription fontSize="xs">
              Your evening routine should focus on repair and rejuvenation. 
              This is the best time to use active ingredients like retinol and exfoliants.
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
              timeOfDay="evening"
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
          colorScheme="purple"
          size="sm"
          isDisabled={true} // Enable when custom steps are implemented
        >
          Add Custom Step
        </Button>
      </Flex>
    </Box>
  );
};

export default EveningRoutine;
