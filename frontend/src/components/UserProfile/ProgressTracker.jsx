import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  VStack,
  HStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
  IconButton,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Spinner,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Icon,
  Progress,
  SimpleGrid,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaCamera,
  FaUpload,
  FaCalendarAlt,
  FaChartLine,
  FaTrashAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaRegSmile,
  FaRegMeh,
  FaRegFrown,
  FaPlus,
  FaInfoCircle,
} from 'react-icons/fa';
import { uploadProgressImage, getProgressHistory } from '../../services/api';

const ProgressTracker = () => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progressHistory, setProgressHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [mood, setMood] = useState('neutral');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [timeframe, setTimeframe] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDetailOpen, 
    onOpen: onDetailOpen, 
    onClose: onDetailClose 
  } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const itemsPerPage = 9;
  
  useEffect(() => {
    fetchProgressHistory();
  }, [timeframe]);
  
  const fetchProgressHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getProgressHistory();
      
      // Filter based on timeframe if needed
      let filteredData = data;
      const now = new Date();
      
      if (timeframe === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        filteredData = data.filter(item => new Date(item.date) >= oneMonthAgo);
      } else if (timeframe === 'three_months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        filteredData = data.filter(item => new Date(item.date) >= threeMonthsAgo);
      } else if (timeframe === 'six_months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        filteredData = data.filter(item => new Date(item.date) >= sixMonthsAgo);
      }
      
      // Sort by date (newest first)
      filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setProgressHistory(filteredData);
    } catch (error) {
      toast({
        title: 'Error fetching progress history',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, etc.)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setNewImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleConcernToggle = (concern) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter(c => c !== concern));
    } else {
      setConcerns([...concerns, concern]);
    }
  };
  
  const handleUpload = async () => {
    if (!newImage) {
      toast({
        title: 'No image selected',
        description: 'Please select an image to upload',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', newImage);
      formData.append('notes', notes);
      formData.append('date', selectedDate);
      formData.append('concerns', JSON.stringify(concerns));
      formData.append('mood', mood);
      
      await uploadProgressImage(formData);
      
      toast({
        title: 'Progress image uploaded',
        description: 'Your skin progress image has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setNewImage(null);
      setNewImagePreview(null);
      setNotes('');
      setConcerns([]);
      setMood('neutral');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      
      // Refresh progress history
      fetchProgressHistory();
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error uploading image',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleImageClick = (image) => {
    setSelectedImage(image);
    onDetailOpen();
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  const totalPages = Math.ceil(progressHistory.length / itemsPerPage);
  const currentItems = progressHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate progress between two dates
  const calculateProgress = (startImage, endImage) => {
    if (!startImage || !endImage || !startImage.skinScore || !endImage.skinScore) {
      return null;
    }
    
    const startScore = startImage.skinScore;
    const endScore = endImage.skinScore;
    const difference = endScore - startScore;
    
    return {
      difference,
      percentage: ((difference / startScore) * 100).toFixed(1),
      improved: difference > 0
    };
  };
  
  // Get the first and latest images for comparison
  const firstImage = progressHistory.length > 0 ? progressHistory[progressHistory.length - 1] : null;
  const latestImage = progressHistory.length > 0 ? progressHistory[0] : null;
  const overallProgress = calculateProgress(firstImage, latestImage);

  return (
    <Box>
      <Flex 
        justify="space-between" 
        align="center" 
        mb={6}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Heading size="lg">Skin Progress Tracker</Heading>
          <Text color="gray.600">
            Track your skin's journey and see how it improves over time
          </Text>
        </Box>
        
        <HStack>
          <Select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            w="150px"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="three_months">Last 3 Months</option>
            <option value="six_months">Last 6 Months</option>
          </Select>
          
          <Button
            leftIcon={<FaCamera />}
            colorScheme="teal"
            onClick={onOpen}
          >
            Add New Photo
          </Button>
        </HStack>
      </Flex>
      
      {/* Progress Summary */}
      {progressHistory.length > 1 && overallProgress && (
        <Box 
          mb={6} 
          p={5} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={bgColor}
          boxShadow="md"
        >
          <Heading size="md" mb={4}>Your Skin Journey</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box>
              <Text fontWeight="medium" mb={1}>First Photo</Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                {formatDate(firstImage.date)}
              </Text>
              <Box 
                h="150px" 
                position="relative" 
                borderRadius="md" 
                overflow="hidden"
                borderWidth="1px"
              >
                <Image 
                  src={firstImage.imageUrl} 
                  alt="First progress photo" 
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
              </Box>
            </Box>
            
            <Box textAlign="center">
              <Heading size="md" mb={2}>Overall Progress</Heading>
              <Box 
                borderRadius="full" 
                bg={overallProgress.improved ? "green.100" : "red.100"} 
                p={4}
                mb={3}
              >
                <Heading 
                  size="xl" 
                  color={overallProgress.improved ? "green.500" : "red.500"}
                >
                  {overallProgress.improved ? '+' : ''}{overallProgress.percentage}%
                </Heading>
              </Box>
              <Text>
                {overallProgress.improved 
                  ? "Your skin has improved!" 
                  : "Keep working on your routine"}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Over {Math.round((new Date(latestImage.date) - new Date(firstImage.date)) / (1000 * 60 * 60 * 24))} days
              </Text>
            </Box>
            
            <Box>
              <Text fontWeight="medium" mb={1}>Latest Photo</Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                {formatDate(latestImage.date)}
              </Text>
              <Box 
                h="150px" 
                position="relative" 
                borderRadius="md" 
                overflow="hidden"
                borderWidth="1px"
              >
                <Image 
                  src={latestImage.imageUrl} 
                  alt="Latest progress photo" 
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
              </Box>
            </Box>
          </SimpleGrid>
        </Box>
      )}
      
      {/* Main Content */}
      <Box 
        p={5} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg={bgColor}
        boxShadow="md"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Progress Photos</Heading>
          
          <HStack>
            <IconButton
              icon={<FaSearch />}
              aria-label="Grid view"
              variant={viewMode === 'grid' ? 'solid' : 'outline'}
              colorScheme="teal"
              onClick={() => setViewMode('grid')}
            />
            <IconButton
              icon={<FaChartLine />}
              aria-label="Timeline view"
              variant={viewMode === 'timeline' ? 'solid' : 'outline'}
              colorScheme="teal"
              onClick={() => setViewMode('timeline')}
            />
          </HStack>
        </Flex>
        
        {isLoading ? (
          <Flex justify="center" align="center" direction="column" py={10}>
            <Spinner size="xl" color="teal.500" mb={4} />
            <Text>Loading your progress history...</Text>
          </Flex>
        ) : progressHistory.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Icon as={FaCamera} boxSize={12} color="gray.300" mb={4} />
            <Heading size="md" mb={2}>No progress photos yet</Heading>
            <Text color="gray.600" mb={6}>
              Start tracking your skin's journey by adding your first photo
            </Text>
            <Button
              leftIcon={<FaCamera />}
              colorScheme="teal"
              onClick={onOpen}
            >
              Add First Photo
            </Button>
          </Box>
        ) : viewMode === 'grid' ? (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {currentItems.map((item, index) => (
                <Box
                  key={index}
                  borderWidth="1px"
                  borderRadius="md"
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => handleImageClick(item)}
                  transition="transform 0.2s"
                  _hover={{ transform: 'scale(1.02)' }}
                >
                  <Box position="relative" h="200px">
                    <Image
                      src={item.imageUrl}
                      alt={`Progress photo from ${item.date}`}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      bg="blackAlpha.600"
                      p={2}
                      color="white"
                    >
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" fontWeight="medium">
                          {formatDate(item.date)}
                        </Text>
                        {item.skinScore && (
                          <Badge colorScheme={item.skinScore > 70 ? "green" : item.skinScore > 50 ? "yellow" : "red"}>
                            Score: {item.skinScore}
                          </Badge>
                        )}
                      </Flex>
                    </Box>
                  </Box>
                  
                  <Box p={3}>
                    <Flex align="center" mb={2}>
                      <Icon 
                        as={item.mood === 'happy' ? FaRegSmile : item.mood === 'sad' ? FaRegFrown : FaRegMeh} 
                        color={item.mood === 'happy' ? "green.500" : item.mood === 'sad' ? "red.500" : "yellow.500"}
                        mr={2}
                      />
                      <Text fontSize="sm" noOfLines={1}>
                        {item.notes || "No notes added"}
                      </Text>
                    </Flex>
                    
                    <Flex wrap="wrap" gap={1}>
                      {item.concerns && item.concerns.slice(0, 2).map((concern, idx) => (
                        <Tag key={idx} size="sm" colorScheme="blue" fontSize="xs">
                          {concern}
                        </Tag>
                      ))}
                      {item.concerns && item.concerns.length > 2 && (
                        <Tag size="sm" variant="outline" fontSize="xs">
                          +{item.concerns.length - 2} more
                        </Tag>
                      )}
                    </Flex>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Flex justify="center" mt={6}>
                <HStack>
                  <IconButton
                    icon={<FaChevronLeft />}
                    aria-label="Previous page"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    size="sm"
                  />
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={currentPage === i + 1 ? "solid" : "outline"}
                      colorScheme={currentPage === i + 1 ? "teal" : "gray"}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <IconButton
                    icon={<FaChevronRight />}
                    aria-label="Next page"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    size="sm"
                  />
                </HStack>
              </Flex>
            )}
          </>
        ) : (
          <VStack spacing={6} align="stretch">
            {progressHistory.map((item, index) => {
              const prevItem = progressHistory[index + 1];
              const progress = calculateProgress(prevItem, item);
              
              return (
                <Box key={index}>
                  <Flex 
                    direction={{ base: "column", md: "row" }} 
                    borderWidth="1px"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <Box 
                      w={{ base: "100%", md: "200px" }} 
                      h={{ base: "200px", md: "auto" }}
                      cursor="pointer"
                      onClick={() => handleImageClick(item)}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={`Progress photo from ${item.date}`}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                      />
                    </Box>
                    
                    <Box flex="1" p={4}>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Heading size="sm">{formatDate(item.date)}</Heading>
                        {item.skinScore && (
                          <Badge 
                            colorScheme={item.skinScore > 70 ? "green" : item.skinScore > 50 ? "yellow" : "red"}
                            fontSize="md"
                            px={2}
                            py={1}
                          >
                            Skin Score: {item.skinScore}
                          </Badge>
                        )}
                      </Flex>
                      
                      {progress && (
                        <Box mb={3} p={2} bg={progress.improved ? "green.50" : "red.50"} borderRadius="md">
                          <Flex align="center">
                            <Icon 
                              as={progress.improved ? FaChevronRight : FaChevronRight} 
                              color={progress.improved ? "green.500" : "red.500"}
                              mr={2}
                              transform={progress.improved ? "rotate(90deg)" : "rotate(-90deg)"}
                            />
                            <Text fontWeight="medium" color={progress.improved ? "green.600" : "red.600"}>
                              {progress.improved ? "Improved by" : "Decreased by"} {Math.abs(progress.percentage)}% since previous photo
                            </Text>
                          </Flex>
                        </Box>
                      )}
                      
                      <Text mb={3}>{item.notes || "No notes added for this entry."}</Text>
                      
                      <HStack mb={3}>
                        <Icon 
                          as={item.mood === 'happy' ? FaRegSmile : item.mood === 'sad' ? FaRegFrown : FaRegMeh} 
                          color={item.mood === 'happy' ? "green.500" : item.mood === 'sad' ? "red.500" : "yellow.500"}
                        />
                        <Text>
                          Feeling {item.mood === 'happy' ? "good" : item.mood === 'sad' ? "not great" : "okay"} about my skin
                        </Text>
                      </HStack>
                      
                      {item.concerns && item.concerns.length > 0 && (
                        <Box>
                          <Text fontWeight="medium" mb={1}>Concerns:</Text>
                          <Flex wrap="wrap" gap={2}>
                            {item.concerns.map((concern, idx) => (
                              <Tag key={idx} colorScheme="blue">
                                {concern}
                              </Tag>
                            ))}
                          </Flex>
                        </Box>
                      )}
                    </Box>
                  </Flex>
                  
                  {index < progressHistory.length - 1 && (
                    <Flex align="center" my={4}>
                      <Box flex="1" h="1px" bg="gray.200" />
                      <Text mx={4} fontSize="sm" color="gray.500">
                        {Math.round((new Date(item.date) - new Date(progressHistory[index + 1].date)) / (1000 * 60 * 60 * 24))} days
                      </Text>
                      <Box flex="1" h="1px" bg="gray.200" />
                    </Flex>
                  )}
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
      
      {/* Add New Photo Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Progress Photo</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Tips for consistent tracking</AlertTitle>
                <AlertDescription fontSize="xs">
                  For best results, take photos in the same lighting, position, and time of day.
                  Remove makeup and take photos before applying skincare products.
                </AlertDescription>
              </Box>
            </Alert>
            
            <FormControl mb={4}>
              <FormLabel>Upload Photo</FormLabel>
              {newImagePreview ? (
                <Box position="relative" mb={2}>
                  <Image
                    src={newImagePreview}
                    alt="Preview"
                    maxH="300px"
                    mx="auto"
                    borderRadius="md"
                  />
                  <IconButton
                    icon={<FaTrashAlt />}
                    colorScheme="red"
                    size="sm"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={() => {
                      setNewImage(null);
                      setNewImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  />
                </Box>
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  p={6}
                  borderWidth="2px"
                  borderRadius="md"
                  borderStyle="dashed"
                  borderColor="gray.300"
                  bg="gray.50"
                  cursor="pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Icon as={FaUpload} boxSize={8} color="gray.400" mb={3} />
                  <Text mb={2}>Click to upload or drag and drop</Text>
                  <Text fontSize="xs" color="gray.500">
                    PNG, JPG or JPEG (max. 5MB)
                  </Text>
                </Flex>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>How does your skin feel today?</FormLabel>
              <HStack spacing={4}>
                <Button
                  leftIcon={<FaRegSmile />}
                  colorScheme={mood === 'happy' ? 'green' : 'gray'}
                  variant={mood === 'happy' ? 'solid' : 'outline'}
                  onClick={() => setMood('happy')}
                >
                  Good
                </Button>
                <Button
                  leftIcon={<FaRegMeh />}
                  colorScheme={mood === 'neutral' ? 'yellow' : 'gray'}
                  variant={mood === 'neutral' ? 'solid' : 'outline'}
                  onClick={() => setMood('neutral')}
                >
                  Okay
                </Button>
                <Button
                  leftIcon={<FaRegFrown />}
                  colorScheme={mood === 'sad' ? 'red' : 'gray'}
                  variant={mood === 'sad' ? 'solid' : 'outline'}
                  onClick={() => setMood('sad')}
                >
                  Not Great
                </Button>
              </HStack>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Current Skin Concerns</FormLabel>
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2} mb={2}>
                {['Acne', 'Dryness', 'Redness', 'Oiliness', 'Dark Spots', 'Fine Lines', 
                  'Texture', 'Dullness', 'Sensitivity'].map((concern) => (
                  <Button
                    key={concern}
                    size="sm"
                    colorScheme={concerns.includes(concern) ? 'blue' : 'gray'}
                    variant={concerns.includes(concern) ? 'solid' : 'outline'}
                    onClick={() => handleConcernToggle(concern)}
                  >
                    {concern}
                  </Button>
                ))}
              </SimpleGrid>
            </FormControl>
            
            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                placeholder="How is your skin today? Any changes or improvements you've noticed?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <FormHelperText>
                Include details about your current routine, diet changes, or environmental factors.
              </FormHelperText>
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading..."
              isDisabled={!newImage}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Image Detail Modal */}
      {selectedImage && (
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {formatDate(selectedImage.date)}
              {selectedImage.skinScore && (
                <Badge 
                  ml={2} 
                  colorScheme={selectedImage.skinScore > 70 ? "green" : selectedImage.skinScore > 50 ? "yellow" : "red"}
                >
                  Score: {selectedImage.skinScore}
                </Badge>
              )}
            </ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <Image
                src={selectedImage.imageUrl}
                alt={`Progress photo from ${selectedImage.date}`}
                maxH="500px"
                mx="auto"
                borderRadius="md"
                mb={4}
              />
              
              <Divider mb={4} />
              
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontWeight="bold" mb={1}>Mood:</Text>
                  <Flex align="center">
                    <Icon 
                      as={selectedImage.mood === 'happy' ? FaRegSmile : selectedImage.mood === 'sad' ? FaRegFrown : FaRegMeh} 
                      color={selectedImage.mood === 'happy' ? "green.500" : selectedImage.mood === 'sad' ? "red.500" : "yellow.500"}
                      mr={2}
                      boxSize={5}
                    />
                    <Text>
                      {selectedImage.mood === 'happy' 
                        ? "Feeling good about my skin" 
                        : selectedImage.mood === 'sad' 
                          ? "Not happy with my skin" 
                          : "Neutral feelings about my skin"}
                    </Text>
                  </Flex>
                </Box>
                
                {selectedImage.concerns && selectedImage.concerns.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>Concerns:</Text>
                    <Flex wrap="wrap" gap={2}>
                      {selectedImage.concerns.map((concern, idx) => (
                        <Tag key={idx} colorScheme="blue">
                          {concern}
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Notes:</Text>
                  <Text>{selectedImage.notes || "No notes added for this entry."}</Text>
                </Box>
                
                {selectedImage.skinAnalysis && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>Skin Analysis:</Text>
                    <SimpleGrid columns={2} spacing={2}>
                      {Object.entries(selectedImage.skinAnalysis).map(([key, value]) => (
                        <Box key={key}>
                          <Text fontSize="sm" color="gray.600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                          <Progress value={value} colorScheme="teal" size="sm" />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" onClick={onDetailClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default ProgressTracker;
