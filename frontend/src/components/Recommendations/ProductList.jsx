import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Flex,
  Button,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Icon,
  Select,
  HStack,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FaSyncAlt, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import ProductCard from './ProductCard';
import FilterOptions from './FilterOptions';
import { getRecommendations } from '../../services/api
