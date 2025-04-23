import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Checkbox,
  CheckboxGroup,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Flex,
  Divider,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FilterOptions = ({ 
  filters, 
  onFilterChange, 
  onResetFilters, 
  isLoading = false,
  showMobileFilters = false,
  onToggleMobileFilters = () => {},
  isMobile = false
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 200]);
  const [selectedIngredients, setSelectedIngredients] = useState(filters.ingredients || []);
  const [ingredientInput, setIngredientInput] = useState('');
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 200]);
    setSelectedIngredients(filters.ingredients || []);
  }, [filters]);

  const handleCheckboxChange = (field, values) => {
    const updatedFilters = {
      ...localFilters,
      [field]: values
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
  };

  const handlePriceRangeChangeEnd = (values) => {
    const updatedFilters = {
      ...localFilters,
      minPrice: values[0],
      maxPrice: values[1]
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim() && !selectedIngredients.includes(ingredientInput.trim())) {
      const newIngredients = [...selectedIngredients, ingredientInput.trim()];
      setSelectedIngredients(newIngredients);
      setIngredientInput('');
      
      const updatedFilters = {
        ...localFilters,
        ingredients: newIngredients
      };
      setLocalFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    const newIngredients = selectedIngredients.filter(item => item !== ingredient);
    setSelectedIngredients(newIngredients);
    
    const updatedFilters = {
      ...localFilters,
      ingredients: newIngredients
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleResetFilters = () => {
    onResetFilters();
  };

  const filterContent = (
    <VStack align="stretch" spacing={6} w="100%">
      <Box>
        <Heading size="sm" mb={3}>Product Type</Heading>
        <CheckboxGroup 
          colorScheme="teal" 
          value={localFilters.productTypes || []}
          onChange={(values) => handleCheckboxChange('productTypes', values)}
        >
          <VStack align="start" spacing={2}>
            <Checkbox value="cleanser">Cleanser</Checkbox>
            <Checkbox value="toner">Toner</Checkbox>
            <Checkbox value="serum">Serum</Checkbox>
            <Checkbox value="moisturizer">Moisturizer</Checkbox>
            <Checkbox value="sunscreen">Sunscreen</Checkbox>
            <Checkbox value="mask">Mask</Checkbox>
            <Checkbox value="treatment">Treatment</Checkbox>
          </VStack>
        </CheckboxGroup>
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={3}>Skin Concerns</Heading>
        <CheckboxGroup 
          colorScheme="teal" 
          value={localFilters.concerns || []}
          onChange={(values) => handleCheckboxChange('concerns', values)}
        >
          <VStack align="start" spacing={2}>
            <Checkbox value="acne">Acne & Breakouts</Checkbox>
            <Checkbox value="aging">Anti-Aging</Checkbox>
            <Checkbox value="dryness">Dryness</Checkbox>
            <Checkbox value="dullness">Dullness & Uneven Texture</Checkbox>
            <Checkbox value="dark_spots">Dark Spots & Hyperpigmentation</Checkbox>
            <Checkbox value="redness">Redness & Inflammation</Checkbox>
            <Checkbox value="pores">Pores & Oil Control</Checkbox>
            <Checkbox value="sensitivity">Sensitivity & Redness</Checkbox>
          </VStack>
        </CheckboxGroup>
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={3}>Skin Type</Heading>
        <CheckboxGroup 
          colorScheme="teal" 
          value={localFilters.skinTypes || []}
          onChange={(values) => handleCheckboxChange('skinTypes', values)}
        >
          <VStack align="start" spacing={2}>
            <Checkbox value="dry">Dry</Checkbox>
            <Checkbox value="oily">Oily</Checkbox>
            <Checkbox value="combination">Combination</Checkbox>
            <Checkbox value="normal">Normal</Checkbox>
            <Checkbox value="sensitive">Sensitive</Checkbox>
          </VStack>
        </CheckboxGroup>
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={3}>Price Range</Heading>
        <Flex justify="space-between" mb={2}>
          <Text>${priceRange[0]}</Text>
          <Text>${priceRange[1]}</Text>
        </Flex>
        <RangeSlider
          aria-label={['min', 'max']}
          min={0}
          max={200}
          step={5}
          value={priceRange}
          onChange={handlePriceRangeChange}
          onChangeEnd={handlePriceRangeChangeEnd}
          colorScheme="teal"
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <RangeSliderThumb index={0} />
          <RangeSliderThumb index={1} />
        </RangeSlider>
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={3}>Brand</Heading>
        <CheckboxGroup 
          colorScheme="teal" 
          value={localFilters.brands || []}
          onChange={(values) => handleCheckboxChange('brands', values)}
        >
          <VStack align="start" spacing={2}>
            <Checkbox value="cerave">CeraVe</Checkbox>
            <Checkbox value="the_ordinary">The Ordinary</Checkbox>
            <Checkbox value="la_roche_posay">La Roche-Posay</Checkbox>
            <Checkbox value="cetaphil">Cetaphil</Checkbox>
            <Checkbox value="neutrogena">Neutrogena</Checkbox>
            <Checkbox value="paula's_choice">Paula's Choice</Checkbox>
            <Checkbox value="drunk_elephant">Drunk Elephant</Checkbox>
            <Checkbox value="tatcha">Tatcha</Checkbox>
          </VStack>
        </CheckboxGroup>
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={3}>Ingredients</Heading>
        <Text fontSize="sm" color="gray.600" mb={2}>
          Add ingredients you want to include or exclude
        </Text>
        
        <HStack mb={3}>
          <Input
            placeholder="e.g., hyaluronic acid"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={handleKeyDown}
            size="sm"
          />
          <Button 
            size="sm" 
            colorScheme="teal" 
            onClick={handleAddIngredient}
            isDisabled={!ingredientInput.trim()}
          >
            Add
          </Button>
        </HStack>
        
        <Flex wrap="wrap" gap={2}>
          {selectedIngredients.map((ingredient, index) => (
            <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="teal">
              <TagLabel>{ingredient}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveIngredient(ingredient)} />
            </Tag>
          ))}
        </Flex>
      </Box>

      <Divider />

      <Box>
        <Heading size="sm" mb={3}>Additional Filters</Heading>
        <CheckboxGroup 
          colorScheme="teal" 
          value={localFilters.additionalFilters || []}
          onChange={(values) => handleCheckboxChange('additionalFilters', values)}
        >
          <VStack align="start" spacing={2}>
            <Checkbox value="cruelty_free">Cruelty-Free</Checkbox>
            <Checkbox value="vegan">Vegan</Checkbox>
            <Checkbox value="fragrance_free">Fragrance-Free</Checkbox>
            <Checkbox value="alcohol_free">Alcohol-Free</Checkbox>
            <Checkbox value="paraben_free">Paraben-Free</Checkbox>
            <Checkbox value="sulfate_free">Sulfate-Free</Checkbox>
            <Checkbox value="natural">Natural/Clean</Checkbox>
          </VStack>
        </CheckboxGroup>
      </Box>

      <Button 
        leftIcon={<FaTimes />} 
        variant="outline" 
        onClick={handleResetFilters}
        isLoading={isLoading}
      >
        Reset Filters
      </Button>
    </VStack>
  );

  // For mobile view
  if (isMobile) {
    return (
      <Box>
        <Button
          leftIcon={<FaFilter />}
          colorScheme="teal"
          variant="outline"
          onClick={onToggleMobileFilters}
          mb={4}
          w="100%"
        >
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
        </Button>
        
        <Collapse in={showMobileFilters} animateOpacity>
          <Box 
            p={4} 
            bg={bgColor} 
            borderWidth="1px" 
            borderRadius="md" 
            borderColor={borderColor}
            mb={4}
          >
            {filterContent}
          </Box>
        </Collapse>
      </Box>
    );
  }

  // For desktop view
  return (
    <Box 
      p={4} 
      bg={bgColor} 
      borderWidth="1px" 
      borderRadius="md" 
      borderColor={borderColor}
      position="sticky"
      top="20px"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Filters</Heading>
        <IconButton
          icon={<FaTimes />}
          variant="ghost"
          size="sm"
          aria-label="Reset filters"
          onClick={handleResetFilters}
        />
      </Flex>
      
      <Accordion defaultIndex={[0, 1]} allowMultiple>
        <AccordionItem border="none">
          <AccordionButton px={0}>
            <Box flex="1" textAlign="left">
              <Heading size="sm">Product Filters</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} px={0}>
            {filterContent}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default FilterOptions;
