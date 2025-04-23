import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  VStack,
  HStack,
  Avatar,
  Flex,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaEdit,
  FaSignOutAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaChartLine,
  FaAllergies,
  FaSun,
  FaHeart,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AllergiesForm from '../components/UserProfile/AllergiesForm';
import LifestyleFactors from '../components/UserProfile/LifestyleFactors';
import ProgressTracker from '../components/UserProfile/ProgressTracker';
import { getUserProfile, updateUserProfile } from '../services/api';
import { logout, getCurrentUser, updatePassword, isAuthenticated } from '../services/authService';

const Profile = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();
  
  const [user, setUser] = useState(null);
  const [userAllergies, setUserAllergies] = useState([]);
  const [userLifestyle, setUserLifestyle] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });
  
  const bgColor = useColorModeValue('white', 'gray.800');
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login', { state: { returnPath: '/profile' } });
      return;
    }
    
    // Load user data
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
    }
    
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error parsing saved wishlist:', error);
      }
    }
    
    // Fetch user profile from server
    fetchUserProfile();
  }, [navigate]);
  
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getUserProfile();
      
      // Update user state with profile data
      setUser(prevUser => ({
        ...prevUser,
        ...data.user
      }));
      
      // Update form state
      setProfileForm({
        name: data.user.name || '',
        email: data.user.email || '',
      });
      
      // Set allergies and lifestyle data
      setUserAllergies(data.allergies || []);
      setUserLifestyle(data.lifestyle || {});
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error loading profile',
        description: 'Could not load your profile information.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProfileUpdate = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast({
        title: 'Invalid input',
        description: 'Name and email are required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      const updatedProfile = await updateUserProfile(profileForm);
      
      // Update local user state and localStorage
      const updatedUser = {
        ...user,
        name: updatedProfile.name,
        email: updatedProfile.email,
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
