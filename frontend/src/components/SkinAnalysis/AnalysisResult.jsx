import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Progress,
  Badge,
  Divider,
  Grid,
  GridItem,
  Icon,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Image,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaArrowRight,
  FaWater,
  FaOilCan,
  FaSun,
  FaAllergies,
  FaRegChartBar
} from 'react-icons/fa';

const AnalysisResults = ({ results, onViewRecommendations }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  if (!results) {
    return (
      <Box textAlign="center" p={10}>
        <Text>No analysis results available. Please complete the skin analysis first.</Text>
      </Box>
    );
  }

  const {
    skinType,
    skinConcerns,
    skinProperties,
    recommendations,
    skinAge,
    skinScore,
    skinHealthMetrics
  } = results;

  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'teal';
    if (score >= 40) return 'yellow';
    if (score >= 20) return 'orange';
    return 'red';
  };

  // Helper function to get icon based on concern severity
  const getConcernIcon = (severity) => {
    if (severity === 'high') return <Icon as={FaExclamationTriangle} color="red.500" />;
    if (severity === 'medium') return <Icon as={FaInfoCircle} color="yellow.500" />;
    return <Icon as={FaCheckCircle} color="green.500" />;
  };

  return (
    <Box maxW="900px" mx="auto">
      <Flex 
        direction={{ base: 'column', md: 'row' }}
        bg={cardBg}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        mb={6}
      >
        <Box 
          w={{ base: '100%', md: '40%' }}
          bg="teal.500"
          color="white"
          p={6}
        >
          <Heading size="xl" mb={2}>Your Skin Analysis</Heading>
          <Text fontSize="lg" mb={6} opacity={0.9}>
            Based on your {results.analysisMethod === 'quiz' ? 'quiz responses' : 'uploaded image'}
          </Text>
          
          <VStack align="stretch" spacing={6}>
            <Box>
              <Flex justify="space-between" mb={1}>
                <Text fontWeight="bold">Overall Skin Health</Text>
                <Text fontWeight="bold">{skinScore}/100</Text>
              </Flex>
              <Progress 
                value={skinScore} 
                colorScheme={getScoreColor(skinScore)}
                borderRadius="full"
                size="lg"
              />
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Skin Type</Text>
              <Badge 
                fontSize="md" 
                px={3} 
                py={1} 
                borderRadius="full" 
                colorScheme="blue"
              >
                {skinType}
              </Badge>
            </Box>
            
            {skinAge && (
              <Box>
                <Text fontWeight="bold" mb={1}>Skin Age</Text>
                <Text fontSize="2xl">{skinAge} years</Text>
              </Box>
            )}
          </VStack>
        </Box>
        
        <Box 
          w={{ base: '100%', md: '60%' }}
          p={6}
        >
          <Heading size="md" mb={4}>Key Skin Properties</Heading>
          
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={6}>
            <Stat>
              <StatLabel><Flex align="center"><Icon as={FaWater} mr={2} />Hydration</Flex></StatLabel>
              <StatNumber>{skinProperties.hydration}%</StatNumber>
              <Progress 
                value={skinProperties.hydration} 
                colorScheme={getScoreColor(skinProperties.hydration)}
                size="sm"
                mt={1}
              />
            </Stat>
            
            <Stat>
              <StatLabel><Flex align="center"><Icon as={FaOilCan} mr={2} />Oil Production</Flex></StatLabel>
              <StatNumber>{skinProperties.oilProduction}%</StatNumber>
              <Progress 
                value={skinProperties.oilProduction} 
                colorScheme={skinProperties.oilProduction > 70 ? 'orange' : 'blue'}
                size="sm"
                mt={1}
              />
            </Stat>
            
            <Stat>
              <StatLabel><Flex align="center"><Icon as={FaSun} mr={2} />UV Sensitivity</Flex></StatLabel>
              <StatNumber>{skinProperties.uvSensitivity}%</StatNumber>
              <Progress 
                value={skinProperties.uvSensitivity} 
                colorScheme={skinProperties.uvSensitivity > 70 ? 'red' : 'green'}
                size="sm"
                mt={1}
              />
            </Stat>
            
            <Stat>
              <StatLabel><Flex align="center"><Icon as={FaAllergies} mr={2} />Sensitivity</Flex></StatLabel>
              <StatNumber>{skinProperties.sensitivity}%</StatNumber>
              <Progress 
                value={skinProperties.sensitivity} 
                colorScheme={skinProperties.sensitivity > 70 ? 'red' : 'green'}
                size="sm"
                mt={1}
              />
            </Stat>
          </SimpleGrid>
          
          <Button 
            rightIcon={<FaArrowRight />} 
            colorScheme="teal" 
            size="lg" 
            w="100%"
            onClick={onViewRecommendations}
          >
            View Personalized Recommendations
          </Button>
        </Box>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box 
          bg={cardBg}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
        >
          <Heading size="md" mb={4}>Skin Concerns</Heading>
          
          <VStack align="stretch" spacing={3}>
            {skinConcerns.map((concern, index) => (
              <Flex 
                key={index}
                justify="space-between"
                align="center"
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
              >
                <HStack>
                  {getConcernIcon(concern.severity)}
                  <Text fontWeight={concern.severity === 'high' ? 'bold' : 'normal'}>
                    {concern.name}
                  </Text>
                </HStack>
                <Badge colorScheme={
                  concern.severity === 'high' ? 'red' : 
                  concern.severity === 'medium' ? 'yellow' : 'green'
                }>
                  {concern.severity}
                </Badge>
              </Flex>
            ))}
          </VStack>
        </Box>
        
        <Box 
          bg={cardBg}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
        >
          <Heading size="md" mb={4}>Detailed Metrics</Heading>
          
          <SimpleGrid columns={2} spacing={4}>
            {Object.entries(skinHealthMetrics).map(([key, value]) => (
              <Box key={key}>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <HStack>
                  <Progress 
                    value={value} 
                    colorScheme={getScoreColor(value)}
                    size="sm"
                    flex="1"
                  />
                  <Text fontWeight="bold" w="40px" textAlign="right">{value}%</Text>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </SimpleGrid>
      
      <Box 
        mt={6}
        bg={cardBg}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={6}
      >
        <Heading size="md" mb={4}>Recommended Ingredients</Heading>
        
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
          {recommendations.ingredients.map((ingredient, index) => (
            <Box 
              key={index}
              borderWidth="1px"
              borderRadius="md"
              p={3}
              textAlign="center"
            >
              <Text fontWeight="bold" mb={1}>{ingredient.name}</Text>
              <Text fontSize="sm" color="gray.600">{ingredient.benefit}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default AnalysisResults;
