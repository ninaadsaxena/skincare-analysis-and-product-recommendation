import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Checkbox,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
  Divider,
  Flex,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  useDisclosure,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaSave, 
  FaInfoCircle, 
  FaAllergies, 
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { updateAllergies } from '../../services/api';

const AllergiesForm = ({ userAllergies = [], onUpdateAllergies, isLoading = false }) => {
  const toast = useToast();
  const [allergies, setAllergies] = useState(userAllergies);
  const [customAllergy, setCustomAllergy] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen: isInfoOpen, onToggle: onInfoToggle } = useDisclosure({ defaultIsOpen: true });

  useEffect(() => {
    setAllergies(userAllergies);
  }, [userAllergies]);

  // Common skincare allergens
  const commonAllergens = [
    { id: 'fragrance', name: 'Fragrance/Parfum', description: 'Synthetic fragrances, common irritant' },
    { id: 'alcohol', name: 'Alcohol (Denatured)', description: 'Can be drying and irritating' },
    { id: 'essential_oils', name: 'Essential Oils', description: 'Natural but potentially irritating' },
    { id: 'parabens', name: 'Parabens', description: 'Preservatives (methyl-, propyl-, butyl-)' },
    { id: 'sulfates', name: 'Sulfates', description: 'SLS, SLES - cleansing agents' },
    { id: 'formaldehyde', name: 'Formaldehyde Releasers', description: 'Preservatives that release formaldehyde' },
    { id: 'propylene_glycol', name: 'Propylene Glycol', description: 'Humectant and penetration enhancer' },
    { id: 'lanolin', name: 'Lanolin', description: 'Derived from sheep wool, moisturizing' },
    { id: 'mineral_oil', name: 'Mineral Oil', description: 'Petroleum-derived occlusive' },
    { id: 'silicones', name: 'Silicones', description: 'Dimethicone and other -cones' },
    { id: 'chemical_sunscreens', name: 'Chemical Sunscreens', description: 'Avobenzone, oxybenzone, etc.' },
    { id: 'coconut_derivatives', name: 'Coconut Derivatives', description: 'Coconut oil, caprylic/capric triglycerides' },
    { id: 'witch_hazel', name: 'Witch Hazel', description: 'Astringent plant extract' },
    { id: 'salicylic_acid', name: 'Salicylic Acid', description: 'BHA exfoliant' },
    { id: 'niacinamide', name: 'Niacinamide', description: 'Vitamin B3 derivative' },
  ];

  const handleToggleAllergen = (allergenId) => {
    if (allergies.includes(allergenId)) {
      setAllergies(allergies.filter(id => id !== allergenId));
    } else {
      setAllergies([...allergies, allergenId]);
    }
  };

  const handleAddCustomAllergen = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const handleRemoveAllergen = (allergen) => {
    setAllergies(allergies.filter(a => a !== allergen));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomAllergen();
    }
  };

  const handleSaveAllergies = async () => {
    setIsSaving(true);
    try {
      await updateAllergies({ allergies });
      onUpdateAllergies(allergies);
      toast({
        title: 'Allergies updated',
        description: 'Your ingredient sensitivities have been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating allergies',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        p={6} 
        boxShadow="md"
        bg="white"
      >
        <Flex justify="center" align="center" direction="column" py={10}>
          <Spinner size="xl" color="teal.500" mb={4} />
          <Text>Loading your ingredient sensitivities...</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={6} 
      boxShadow="md"
      bg="white"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Flex align="center">
          <Icon as={FaAllergies} color="red.500" mr={2} boxSize={5} />
          <Heading size="md">Ingredient Sensitivities & Allergies</Heading>
        </Flex>
        
        <Button
          leftIcon={<FaSave />}
          colorScheme="teal"
          size="sm"
          onClick={handleSaveAllergies}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </Flex>
      
      <Collapse in={isInfoOpen} animateOpacity>
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">Why this matters</AlertTitle>
            <AlertDescription fontSize="xs">
              Identifying ingredients that irritate your skin helps us recommend products that are safe for you.
              Products containing your listed sensitivities will be filtered out from recommendations.
            </AlertDescription>
          </Box>
          <Button
            size="sm"
            variant="ghost"
            onClick={onInfoToggle}
            rightIcon={<FaChevronUp />}
          >
            Hide
          </Button>
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
          Show info
        </Button>
      )}
      
      <Text mb={4}>
        Select ingredients that your skin is sensitive to or that you prefer to avoid:
      </Text>
      
      <Box mb={6}>
        <Heading size="sm" mb={3}>Common Allergens & Irritants</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
          {commonAllergens.map((allergen) => (
            <Checkbox
              key={allergen.id}
              isChecked={allergies.includes(allergen.id)}
              onChange={() => handleToggleAllergen(allergen.id)}
              colorScheme="red"
            >
              <Box>
                <Text fontWeight="medium">{allergen.name}</Text>
                <Text fontSize="xs" color="gray.600">{allergen.description}</Text>
              </Box>
            </Checkbox>
          ))}
        </SimpleGrid>
      </Box>
      
      <Divider my={4} />
      
      <Box mb={6}>
        <Heading size="sm" mb={3}>Custom Ingredients to Avoid</Heading>
        <HStack mb={4}>
          <Input
            placeholder="Enter ingredient name"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            leftIcon={<FaPlus />}
            colorScheme="teal"
            onClick={handleAddCustomAllergen}
            isDisabled={!customAllergy.trim()}
          >
            Add
          </Button>
        </HStack>
        
        <Flex wrap="wrap" gap={2}>
          {allergies
            .filter(allergen => !commonAllergens.some(common => common.id === allergen))
            .map((allergen, index) => (
              <Tag
                key={index}
                size="lg"
                borderRadius="full"
                variant="solid"
                colorScheme="red"
              >
                <TagLabel>{allergen}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveAllergen(allergen)} />
              </Tag>
            ))}
        </Flex>
      </Box>
      
      {allergies.length > 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon as={FaExclamationTriangle} />
          <Box>
            <AlertTitle fontSize="sm">Note about allergies</AlertTitle>
            <AlertDescription fontSize="xs">
              If you have severe allergic reactions to any ingredients, please consult with a dermatologist before 
              trying new skincare products, even if they don't contain your listed allergens.
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default AllergiesForm;
