import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Image,
  Flex,
  useToast,
  Progress,
  Heading,
  Icon,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FaUpload, FaCamera, FaInfoCircle } from 'react-icons/fa';
import { analyzeSkinImage } from '../../services/api';

const ImageUploader = ({ onAnalysisComplete }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (!selectedFile.type.match('image.*')) {
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
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setImage(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
      
      // If camera was active, stop it
      if (isCameraActive) {
        stopCamera();
      }
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Could not access camera. Please ensure you have given permission and that your camera is working.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setImage(file);
        setImagePreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      toast({
        title: 'No image selected',
        description: 'Please select or capture an image first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
        }
        return newProgress < 100 ? newProgress : 100;
      });
    }, 200);
    
    try {
      setIsAnalyzing(true);
      const results = await analyzeSkinImage(image);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Short delay to show 100% completion
      setTimeout(() => {
        setIsUploading(false);
        setIsAnalyzing(false);
        onAnalysisComplete(results);
        
        toast({
          title: 'Analysis complete!',
          description: 'Your skin has been analyzed successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setIsAnalyzing(false);
      
      toast({
        title: 'Error analyzing image',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={6} 
      boxShadow="md" 
      bg="white"
      maxW="800px"
      mx="auto"
    >
      <Heading size="lg" mb={2}>Skin Analysis with AI</Heading>
      <Text color="gray.600" mb={6}>
        Upload a clear, well-lit selfie without makeup for the most accurate analysis.
      </Text>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }}
        align="stretch"
        gap={6}
      >
        <Box flex="1">
          <VStack spacing={4} align="stretch">
            {!imagePreview ? (
              <Box 
                borderWidth="2px" 
                borderRadius="md" 
                borderStyle="dashed" 
                borderColor="gray.300"
                h="300px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bg="gray.50"
                p={4}
              >
                {isCameraActive ? (
                  <>
                    <Box position="relative" w="100%" h="100%">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.375rem' }}
                      />
                      <Button
                        position="absolute"
                        bottom="10px"
                        left="50%"
                        transform="translateX(-50%)"
                        colorScheme="teal"
                        onClick={captureImage}
                        leftIcon={<FaCamera />}
                      >
                        Capture
                      </Button>
                    </Box>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </>
                ) : (
                  <>
                    <Icon as={FaUpload} w={10} h={10} color="gray.400" mb={4} />
                    <Text textAlign="center" color="gray.500">
                      Drag and drop your image here, or click to select
                    </Text>
                    {cameraError && (
                      <Alert status="error" mt={4} borderRadius="md">
                        <AlertIcon />
                        <AlertDescription fontSize="sm">{cameraError}</AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            ) : (
              <Box 
                position="relative" 
                borderRadius="md" 
                overflow="hidden"
                h="300px"
              >
                <Image 
                  src={imagePreview} 
                  alt="Skin analysis" 
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
                <Button
                  position="absolute"
                  top="10px"
                  right="10px"
                  size="sm"
                  colorScheme="red"
                  onClick={resetImage}
                >
                  Remove
                </Button>
              </Box>
            )}
            
            <Flex gap={4} justify="center">
              {!isCameraActive ? (
                <>
                  <Button
                    leftIcon={<FaUpload />}
                    colorScheme="blue"
                    onClick={() => fileInputRef.current.click()}
                    isDisabled={isUploading || isAnalyzing}
                  >
                    Select Image
                  </Button>
                  <Button
                    leftIcon={<FaCamera />}
                    colorScheme="purple"
                    onClick={startCamera}
                    isDisabled={isUploading || isAnalyzing}
                  >
                    Use Camera
                  </Button>
                </>
              ) : (
                <Button
                  colorScheme="gray"
                  onClick={stopCamera}
                >
                  Cancel
                </Button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </Flex>
            
            {imagePreview && (
              <Button
                colorScheme="teal"
                onClick={handleUpload}
                isLoading={isUploading || isAnalyzing}
                loadingText={isAnalyzing ? "Analyzing" : "Uploading"}
                size="lg"
                mt={2}
              >
                Analyze Skin
              </Button>
            )}
            
            {isUploading && (
              <Box>
                <Text mb={1} fontSize="sm">
                  {isAnalyzing ? 'Analyzing your skin...' : 'Uploading image...'}
                </Text>
                <Progress value={uploadProgress} size="sm" colorScheme="teal" borderRadius="full" />
              </Box>
            )}
          </VStack>
        </Box>
        
        <Box 
          flex="1" 
          borderWidth="1px" 
          borderRadius="md" 
          p={4}
          bg="blue.50"
        >
          <Flex align="center" mb={3}>
            <Icon as={FaInfoCircle} color="blue.500" mr={2} />
            <Heading size="sm" color="blue.700">Tips for Best Results</Heading>
          </Flex>
          
          <VStack align="start" spacing={3} fontSize="sm">
            <Text>• Use natural lighting (daylight is best)</Text>
            <Text>• Remove makeup and cleanse your face</Text>
            <Text>• Capture your entire face in the frame</Text>
            <Text>• Take the photo straight-on, not at an angle</Text>
            <Text>• Avoid using filters or editing the photo</Text>
            <Text>• For most accurate results, use a recent photo</Text>
          </VStack>
          
          <Alert status="info" mt={6} borderRadius="md" fontSize="sm">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Privacy Note</AlertTitle>
              <AlertDescription fontSize="xs">
                Your photos are analyzed securely and not stored permanently after analysis is complete.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>
      </Flex>
    </Box>
  );
};

export default ImageUploader;
