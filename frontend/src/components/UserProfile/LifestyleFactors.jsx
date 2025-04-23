import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  useToast,
  Divider,
  Flex,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Tag,
  useColorModeValue,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { 
  FaSave, 
  FaWater, 
  FaSun, 
  FaMoon, 
  FaUtensils, 
  FaRunning, 
  FaSmog, 
  FaMapMarkerAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { updateLifestyleFactors } from '../../services/api';

const LifestyleFactors = ({ userLifestyle = {}, onUpdateLifestyle, isLoading = false }) => {
  const toast = useToast();
  const [lifestyle, setLifestyle] = useState({
    waterIntake: 6,
    sleepHours: 7,
    stressLevel: 'moderate',
    sunExposure: 'moderate',
    exercise: 'moderate',
    diet: [],
    location: '',
    climate: '',
    pollution: 'moderate',
    ...userLifestyle
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  
  useEffect(() => {
    setLifestyle({
      waterIntake: 6,
      sleepHours: 7,
      stressLevel: 'moderate',
      sunExposure: 'moderate',
      exercise: 'moderate',
      diet: [],
      location: '',
      climate: '',
      pollution: 'moderate',
      ...userLifestyle
    });
  }, [userLifestyle]);

  const handleChange = (field, value) => {
    setLifestyle({
      ...lifestyle,
      [field]: value
    });
  };

  const handleSaveLifestyle = async () => {
    setIsSaving(true);
    try {
      await updateLifestyleFactors(lifestyle);
      onUpdateLifestyle(lifestyle);
      toast({
        title: 'Lifestyle factors updated',
        description: 'Your lifestyle information has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating lifestyle factors',
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
        bg={bgColor}
      >
        <Flex justify="center" align="center" direction="column" py={10}>
          <Spinner size="xl" color="teal.500" mb={4} />
          <Text>Loading your lifestyle information...</Text>
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
      bg={bgColor}
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Lifestyle Factors</Heading>
        <Button
          leftIcon={<FaSave />}
          colorScheme="teal"
          size="sm"
          onClick={handleSaveLifestyle}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </Flex>
      
      <Alert status="info" mb={6} borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Why this matters</AlertTitle>
          <AlertDescription fontSize="xs">
            Your lifestyle significantly affects your skin health. This information helps us provide more personalized skincare recommendations.
          </AlertDescription>
        </Box>
      </Alert>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <FormControl mb={6}>
            <Flex align="center" mb={2}>
              <Icon as={FaWater} mr={2} color="blue.500" />
              <FormLabel mb={0} fontWeight="medium">Daily Water Intake</FormLabel>
              <Tooltip label="Staying hydrated is essential for skin health">
                <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
              </Tooltip>
            </Flex>
            <HStack spacing={4}>
              <Slider
                value={lifestyle.waterIntake}
                min={0}
                max={16}
                step={1}
                onChange={(val) => handleChange('waterIntake', val)}
                flex="1"
                colorScheme="blue"
              >
                <SliderMark value={4} mt={2} fontSize="xs" color="gray.500">
                  4
                </SliderMark>
                <SliderMark value={8} mt={2} fontSize="xs" color="gray.500">
                  8
                </SliderMark>
                <SliderMark value={12} mt={2} fontSize="xs" color="gray.500">
                  12
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="blue.500" as={FaWater} />
                </SliderThumb>
              </Slider>
              <NumberInput
                value={lifestyle.waterIntake}
                onChange={(_, val) => handleChange('waterIntake', val)}
                min={0}
                max={16}
                w="80px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
            <FormHelperText>Glasses of water per day (8 oz each)</FormHelperText>
          </FormControl>
          
          <FormControl mb={6}>
            <Flex align="center" mb={2}>
              <Icon as={FaMoon} mr={2} color="purple.500" />
              <FormLabel mb={0} fontWeight="medium">Sleep Hours</FormLabel>
              <Tooltip label="Sleep is when your skin repairs itself">
                <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
              </Tooltip>
            </Flex>
            <HStack spacing={4}>
              <Slider
                value={lifestyle.sleepHours}
                min={4}
                max={12}
                step={0.5}
                onChange={(val) => handleChange('sleepHours', val)}
                flex="1"
                colorScheme="purple"
              >
                <SliderMark value={6} mt={2} fontSize="xs" color="gray.500">
                  6
                </SliderMark>
                <SliderMark value={8} mt={2} fontSize="xs" color="gray.500">
                  8
                </SliderMark>
                <SliderMark value={10} mt={2} fontSize="xs" color="gray.500">
                  10
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="purple.500" as={FaMoon} />
                </SliderThumb>
              </Slider>
              <NumberInput
                value={lifestyle.sleepHours}
                onChange={(_, val) => handleChange('sleepHours', val)}
                min={4}
                max={12}
                step={0.5}
                w="80px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
            <FormHelperText>Average hours of sleep per night</FormHelperText>
          </FormControl>
          
          <FormControl mb={6}>
            <Flex align="center" mb={2}>
              <Icon as={FaSun} mr={2} color="orange.500" />
              <FormLabel mb={0} fontWeight="medium">Sun Exposure</FormLabel>
              <Tooltip label="UV exposure affects aging and pigmentation">
                <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
              </Tooltip>
            </Flex>
            <RadioGroup
              value={lifestyle.sunExposure}
              onChange={(val) => handleChange('sunExposure', val)}
            >
              <HStack spacing={4} wrap="wrap">
                <Radio value="minimal">Minimal</Radio>
                <Radio value="moderate">Moderate</Radio>
                <Radio value="high">High</Radio>
                <Radio value="very_high">Very High</Radio>
              </HStack>
            </RadioGroup>
            <FormHelperText>How much time do you spend in the sun?</FormHelperText>
          </FormControl>
          
          <FormControl mb={6}>
            <Flex align="center" mb={2}>
              <Icon as={FaRunning} mr={2} color="green.500" />
              <FormLabel mb={0} fontWeight="medium">Exercise Level</FormLabel>
              <Tooltip label="Exercise affects circulation and skin health">
                <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
              </Tooltip>
            </Flex>
            <RadioGroup
              value={lifestyle.exercise}
              onChange={(val) => handleChange('exercise', val)}
            >
              <HStack spacing={4} wrap="wrap">
                <Radio value="sedentary">Sedentary</Radio>
                <Radio value="light">Light</Radio>
                <Radio value="moderate">Moderate</Radio>
                <Radio value="intense">Intense</Radio>
              </HStack>
            </RadioGroup>
            <FormHelperText>How often do you exercise?</FormHelperText>
          </FormControl>
        </GridItem>
        
        <GridItem>
          <FormControl mb={6}>
            <Flex align="center" mb={2}>
              <Icon as={FaUtensils} mr={2} color="red.500" />
              <FormLabel mb={0} fontWeight="medium">Diet</FormLabel>
              <Tooltip label="Your diet directly impacts your skin">
                <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
              </Tooltip>
            </Flex>
            <CheckboxGroup
              value={lifestyle.diet}
              onChange={(val) => handleChange('diet', val)}
            >
              <VStack align="start" spacing={2}>
                <Checkbox value="high_sugar">High in sugar</Checkbox>
                <Checkbox value="high_dairy">High in dairy</Checkbox>
                <Checkbox value="high_fat">High in fat</Checkbox>
                <Checkbox value="vegetarian">Vegetarian</Checkbox>
                <Checkbox value="vegan">Vegan</Checkbox>
                <Checkbox value="gluten_free">Gluten-free</Checkbox>
                <Checkbox value="high_antioxidants">Rich in antioxidants</Checkbox>
              </VStack>
            </CheckboxGroup>
            <FormHelperText>Select all that apply to your typical diet</FormHelperText>
          </FormControl>
          
          <FormControl mb={6}>
            <Flex align="center" mb={2}>
              <Icon as={FaMapMarkerAlt} mr={2} color="teal.500" />
              <FormLabel mb={0} fontWeight="medium">Location & Climate</FormLabel>
              <Tooltip label="Climate affects your skin's needs">
                <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
              </Tooltip>
            </Flex>
            <Select
              placeholder="Select climate type"
              value={lifestyle.climate}
              onChange={(e) => handleChange('climate', e.target.value)}
              mb={3}
            >
              <option value="dry">Dry</option>
              <option value="humid">Humid</option>
              <option value="temperate">Temperate</option>
              <option value="tropical">Tropical</option>
              <option value="cold">Cold</option>
              <option value="hot">Hot</option>
              <option value="variable">Variable/Seasonal</option>
            </Select>
            <FormHelperText>What type of climate do you live in?</FormHelperText>
          </FormControl>
          
          <FormControl mb={6}>
            <Flex align="center" mb={2}>
              <Icon as={FaSmog} mr={2} color="gray.500" />
              <FormLabel mb={0} fontWeight="medium">Pollution Exposure</FormLabel>
              <Tooltip label="Pollution can cause oxidative stress to skin">
                <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
              </Tooltip>
            </Flex>
            <RadioGroup
              value={lifestyle.pollution}
              onChange={(val) => handleChange('pollution', val)}
            >
              <HStack spacing={4} wrap="wrap">
                <Radio value="low">Low</Radio>
                <Radio value="moderate">Moderate</Radio>
                <Radio value="high">High</Radio>
                <Radio value="very_high">Very High</Radio>
              </HStack>
            </RadioGroup>
            <FormHelperText>How would you rate the pollution level where you live?</FormHelperText>
          </FormControl>
          
          <FormControl mb={6}>
            <Flex align="center" mb={2}>
              <Icon as={FaInfoCircle} mr={2} color="blue.500" />
              <FormLabel mb={0} fontWeight="medium">Stress Level</FormLabel>
              <Tooltip label="Stress can trigger skin conditions">
                <Icon as={FaInfoCircle} color="gray.400" boxSize={3} />
              </Tooltip>
            </Flex>
            <RadioGroup
              value={lifestyle.stressLevel}
              onChange={(val) => handleChange('stressLevel', val)}
            >
              <HStack spacing={4} wrap="wrap">
                <Radio value="low">Low</Radio>
                <Radio value="moderate">Moderate</Radio>
                <Radio value="high">High</Radio>
                <Radio value="very_high">Very High</Radio>
              </HStack>
            </RadioGroup>
            <FormHelperText>How would you rate your typical stress level?</FormHelperText>
          </FormControl>
        </GridItem>
      </Grid>
      
      <Divider my={6} />
      
      <Alert status="success" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">How this improves your recommendations</AlertTitle>
          <AlertDescription fontSize="xs">
            Your lifestyle information helps us understand environmental and behavioral factors that affect your skin.
            For example, if you live in a dry climate, we'll recommend more hydrating products, or if you have high sun exposure,
            we'll emphasize sun protection.
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
};

export default LifestyleFactors;
