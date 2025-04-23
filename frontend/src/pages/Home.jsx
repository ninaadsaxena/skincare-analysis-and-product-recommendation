import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Badge,
  useColorModeValue,
  Divider,
  Link,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaCamera,
  FaClipboardList,
  FaFlask,
  FaChartLine,
  FaRegLightbulb,
  FaRegSmile,
  FaShieldAlt,
  FaArrowRight,
  FaCheck,
  FaStar,
} from 'react-icons/fa';

const Home = () => {
  const bgGradient = useColorModeValue(
    'linear(to-r, teal.50, blue.50)',
    'linear(to-r, teal.900, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const highlightColor = useColorModeValue('teal.500', 'teal.300');

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient={bgGradient}
        pt={{ base: 10, md: 20 }}
        pb={{ base: 16, md: 28 }}
        px={4}
        borderRadius="lg"
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="center">
            <GridItem>
              <VStack align="flex-start" spacing={6}>
                <Badge colorScheme="teal" fontSize="sm" px={3} py={1} borderRadius="full">
                  Personalized Skincare
                </Badge>
                <Heading
                  as="h1"
                  fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                  fontWeight="bold"
                  lineHeight="shorter"
                >
                  Your Skin Deserves a{' '}
                  <Text as="span" color={highlightColor}>
                    Custom Routine
                  </Text>
                </Heading>
                <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" maxW="600px">
                  Get personalized skincare recommendations based on your unique skin profile, concerns, and goals.
                </Text>
                <HStack spacing={4} pt={2}>
                  <Button
                    as={RouterLink}
                    to="/analysis"
                    size="lg"
                    colorScheme="teal"
                    rightIcon={<FaArrowRight />}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  >
                    Start Skin Analysis
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/recommendations"
                    size="lg"
                    variant="outline"
                    colorScheme="teal"
                  >
                    View Recommendations
                  </Button>
                </HStack>
              </VStack>
            </GridItem>
            <GridItem display={{ base: 'none', lg: 'block' }}>
              <Image
                src="/images/hero-image.png"
                alt="Skincare products"
                borderRadius="lg"
                boxShadow="xl"
                fallbackSrc="https://via.placeholder.com/600x400?text=Personalized+Skincare"
              />
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxW="container.xl" mt={{ base: -10, md: -16 }} position="relative" zIndex={1}>
        <Box
          bg={cardBg}
          borderRadius="xl"
          boxShadow="xl"
          p={{ base: 6, md: 10 }}
        >
          <Heading as="h2" size="xl" mb={8} textAlign="center">
            How It Works
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <VStack align="flex-start" spacing={4}>
              <Flex
                bg="teal.50"
                color="teal.500"
                w={16}
                h={16}
                borderRadius="lg"
                justify="center"
                align="center"
                fontSize="3xl"
              >
                <Icon as={FaCamera} />
              </Flex>
              <Heading as="h3" size="md">
                1. Analyze Your Skin
              </Heading>
              <Text color="gray.600">
                Upload a selfie or take our detailed skin quiz to get an accurate analysis of your skin type, concerns, and needs.
              </Text>
            </VStack>
            <VStack align="flex-start" spacing={4}>
              <Flex
                bg="blue.50"
                color="blue.500"
                w={16}
                h={16}
                borderRadius="lg"
                justify="center"
                align="center"
                fontSize="3xl"
              >
                <Icon as={FaFlask} />
              </Flex>
              <Heading as="h3" size="md">
                2. Get Personalized Recommendations
              </Heading>
              <Text color="gray.600">
                Our AI analyzes your skin profile and matches you with products that address your specific concerns and skin type.
              </Text>
            </VStack>
            <VStack align="flex-start" spacing={4}>
              <Flex
                bg="purple.50"
                color="purple.500"
                w={16}
                h={16}
                borderRadius="lg"
                justify="center"
                align="center"
                fontSize="3xl"
              >
                <Icon as={FaClipboardList} />
              </Flex>
              <Heading as="h3" size="md">
                3. Build Your Routine
              </Heading>
              <Text color="gray.600">
                Create a morning and evening skincare routine with step-by-step guidance and track your progress over time.
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxW="container.xl" mt={20}>
        <Heading as="h2" size="xl" mb={2} textAlign="center">
          Smart Features
        </Heading>
        <Text textAlign="center" fontSize="lg" color="gray.600" mb={12} maxW="800px" mx="auto">
          Our advanced technology helps you achieve your best skin ever with these powerful tools
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
            overflow="hidden"
          >
            <Box
              bg="teal.500"
              color="white"
              p={6}
              display="flex"
              alignItems="center"
              justifyContent="center"
              w={{ base: '100%', sm: '150px' }}
              h={{ base: '100px', sm: 'auto' }}
            >
              <Icon as={FaRegLightbulb} boxSize={10} />
            </Box>
            <Box p={6}>
              <Heading as="h3" size="md" mb={2}>
                AI Skin Analysis
              </Heading>
              <Text color="gray.600" mb={4}>
                Our advanced computer vision technology analyzes your skin's condition, detects concerns, and tracks changes over time.
              </Text>
              <Button
                as={RouterLink}
                to="/analysis"
                variant="link"
                colorScheme="teal"
                rightIcon={<FaArrowRight />}
              >
                Try Skin Analysis
              </Button>
            </Box>
          </Flex>

          <Flex
            direction={{ base: 'column', sm: 'row' }}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
            overflow="hidden"
          >
            <Box
              bg="blue.500"
              color="white"
              p={6}
              display="flex"
              alignItems="center"
              justifyContent="center"
              w={{ base: '100%', sm: '150px' }}
              h={{ base: '100px', sm: 'auto' }}
            >
              <Icon as={FaShieldAlt} boxSize={10} />
            </Box>
            <Box p={6}>
              <Heading as="h3" size="md" mb={2}>
                Ingredient Sensitivity Check
              </Heading>
              <Text color="gray.600" mb={4}>
                Identify products that are safe for your skin by flagging ingredients you're sensitive to or want to avoid.
              </Text>
              <Button
                as={RouterLink}
                to="/profile"
                variant="link"
                colorScheme="blue"
                rightIcon={<FaArrowRight />}
              >
                Set Your Preferences
              </Button>
            </Box>
          </Flex>

          <Flex
            direction={{ base: 'column', sm: 'row' }}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
            overflow="hidden"
          >
            <Box
              bg="purple.500"
              color="white"
              p={6}
              display="flex"
              alignItems="center"
              justifyContent="center"
              w={{ base: '100%', sm: '150px' }}
              h={{ base: '100px', sm: 'auto' }}
            >
              <Icon as={FaRegSmile} boxSize={10} />
            </Box>
            <Box p={6}>
              <Heading as="h3" size="md" mb={2}>
                Personalized Routines
              </Heading>
              <Text color="gray.600" mb={4}>
                Build custom morning and evening skincare routines with products matched to your skin's unique needs.
              </Text>
              <Button
                as={RouterLink}
                to="/routine-planner"
                variant="link"
                colorScheme="purple"
                rightIcon={<FaArrowRight />}
              >
                Create Your Routine
              </Button>
            </Box>
          </Flex>

          <Flex
            direction={{ base: 'column', sm: 'row' }}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
            overflow="hidden"
          >
            <Box
              bg="orange.500"
              color="white"
              p={6}
              display="flex"
              alignItems="center"
              justifyContent="center"
              w={{ base: '100%', sm: '150px' }}
              h={{ base: '100px', sm: 'auto' }}
            >
              <Icon as={FaChartLine} boxSize={10} />
            </Box>
            <Box p={6}>
              <Heading as="h3" size="md" mb={2}>
                Progress Tracking
              </Heading>
              <Text color="gray.600" mb={4}>
                Document your skin's journey with photos and notes to see how your skin improves over time.
              </Text>
              <Button
                as={RouterLink}
                to="/profile"
                variant="link"
                colorScheme="orange"
                rightIcon={<FaArrowRight />}
              >
                Track Your Progress
              </Button>
            </Box>
          </Flex>
        </SimpleGrid>
      </Container>

      {/* Testimonials Section */}
      <Box bg="gray.50" mt={20} py={16}>
        <Container maxW="container.xl">
          <Heading as="h2" size="xl" mb={2} textAlign="center">
            Success Stories
          </Heading>
          <Text textAlign="center" fontSize="lg" color="gray.600" mb={12} maxW="800px" mx="auto">
            See how our personalized skincare recommendations have helped others
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <HStack mb={4}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} as={FaStar} color="yellow.400" />
                ))}
              </HStack>
              <Text fontSize="md" fontStyle="italic" mb={4}>
                "After years of trying random products, I finally found a routine that works for my combination skin. The personalized recommendations were spot on!"
              </Text>
              <HStack>
                <Box
                  w={10}
                  h={10}
                  borderRadius="full"
                  bg="teal.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontWeight="bold">JS</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Jamie S.</Text>
                  <Text fontSize="sm" color="gray.500">
                    Combination Skin
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <HStack mb={4}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} as={FaStar} color="yellow.400" />
                ))}
              </HStack>
              <Text fontSize="md" fontStyle="italic" mb={4}>
                "The skin analysis accurately identified my rosacea concerns and recommended gentle products that didn't irritate my sensitive skin."
              </Text>
              <HStack>
                <Box
                  w={10}
                  h={10}
                  borderRadius="full"
                  bg="blue.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontWeight="bold">MK</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Michael K.</Text>
                  <Text fontSize="sm" color="gray.500">
                    Sensitive Skin
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <HStack mb={4}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} as={FaStar} color="yellow.400" />
                ))}
              </HStack>
              <Text fontSize="md" fontStyle="italic" mb={4}>
                "I love being able to track my progress with photos. After 3 months of following my custom routine, my acne has significantly improved!"
              </Text>
              <HStack>
                <Box
                  w={10}
                  h={10}
                  borderRadius="full"
                  bg="purple.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontWeight="bold">AT</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Aisha T.</Text>
                  <Text fontSize="sm" color="gray.500">
                    Acne-Prone Skin
                  </Text>
                </Box>
              </HStack>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxW="container.xl" my={20}>
        <Box
          bg="teal.500"
          color="white"
          borderRadius="xl"
          p={{ base: 8, md: 12 }}
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            bg="teal.400"
            borderRadius="full"
            w="150px"
            h="150px"
            opacity="0.4"
          />
          <Box
            position="absolute"
            bottom="-50px"
            left="-50px"
            bg="teal.400"
            borderRadius="full"
            w="200px"
            h="200px"
            opacity="0.2"
          />
          <VStack spacing={6} position="relative" zIndex={1}>
            <Heading as="h2" size="xl">
              Start Your Skincare Journey Today
            </Heading>
            <Text fontSize="lg" maxW="700px" mx="auto">
              Get personalized recommendations, build your perfect routine, and track your progress all in one place.
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/analysis"
                size="lg"
                colorScheme="white"
                color="teal.500"
                bg="white"
                _hover={{ bg: 'gray.100' }}
                boxShadow="md"
              >
                Start Skin Analysis
              </Button>
              <Button
                as={RouterLink}
                to="/recommendations"
                size="lg"
                variant="outline"
                colorScheme="white"
                _hover={{ bg: 'teal.600' }}
              >
                Browse Recommendations
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Container>

      {/* Features List */}
      <Container maxW="container.xl" mb={20}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Box>
            <Heading as="h3" size="lg" mb={6}>
              Why Choose Our Platform
            </Heading>
            <VStack align="start" spacing={4}>
              <HStack>
                <Flex
                  bg="green.100"
                  color="green.500"
                  w={8}
                  h={8}
                  borderRadius="full"
                  justify="center"
                  align="center"
                >
                  <Icon as={FaCheck} />
                </Flex>
                <Text>Advanced AI skin analysis technology</Text>
              </HStack>
              <HStack>
                <Flex
                  bg="green.100"
                  color="green.500"
                  w={8}
                  h={8}
                  borderRadius="full"
                  justify="center"
                  align="center"
                >
                  <Icon as={FaCheck} />
                </Flex>
                <Text>Personalized product recommendations</Text>
              </HStack>
              <HStack>
                <Flex
                  bg="green.100"
                  color="green.500"
                  w={8}
                  h={8}
                  borderRadius="full"
                  justify="center"
                  align="center"
                >
                  <Icon as={FaCheck} />
                </Flex>
                <Text>Ingredient sensitivity detection</Text>
              </HStack>
              <HStack>
                <Flex
                  bg="green.100"
                  color="green.500"
                  w={8}
                  h={8}
                  borderRadius="full"
                  justify="center"
                  align="center"
                >
                  <Icon as={FaCheck} />
                </Flex>
                <Text>Step-by-step routine builder</Text>
              </HStack>
              <HStack>
                <Flex
                  bg="green.100"
                  color="green.500"
                  w={8}
                  h={8}
                  borderRadius="full"
                  justify="center"
                  align="center"
                >
                  <Icon as={FaCheck} />
                </Flex>
                <Text>Visual progress tracking</Text>
              </HStack>
            </VStack>
          </Box>

          <Box>
            <Heading as="h3" size="lg" mb={6}>
              Get Started in Minutes
            </Heading>
            <VStack align="start" spacing={6}>
              <HStack align="start" spacing={4}>
                <Flex
                  bg="blue.100"
                  color="blue.500"
                  w={8}
                  h={8}
                  borderRadius="full"
                  justify="center"
                  align="center"
                  mt={1}
                >
                  <Text fontWeight="bold">1</Text>
                </Flex>
                <Box>
                  <Text fontWeight="bold">Create your account</Text>
                  <Text color="gray.600">Sign up to save your skin profile and track your progress</Text>
                </Box>
              </HStack>
              <HStack align="start" spacing={4}>
                <Flex
                  bg="blue.100"
                  color="blue.500"
                  w={8}
                  h={8}
                  borderRadius="full"
                  justify="center"
                  align="center"
                  mt={1}
                >
                  <Text fontWeight="bold">2</Text>
                </Flex>
                <Box>
                  <Text fontWeight="bold">Complete the skin analysis</Text>
                  <Text color="gray.600">Upload a photo or take our comprehensive skin quiz</Text>
                </Box>
              </HStack>
              <HStack align="start" spacing={4}>
                <Flex
                  bg="blue.100"
                  color="blue.500"
                  w={8}
                  h={8}
                  borderRadius="full"
                  justify="center"
                  align="center"
                  mt={1}
                >
                  <Text fontWeight="bold">3</Text>
                </Flex>
                <Box>
                  <Text fontWeight="bold">Get your personalized routine</Text>
                  <Text color="gray.600">Receive product recommendations and build your skincare routine</Text>
                </Box>
              </HStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Home;
