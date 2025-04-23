import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Recommendations from './pages/Recommendations';
import RoutinePlanner from './pages/RoutinePlanner';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Box minH="100vh" display="flex" flexDirection="column">
            <Navbar />
            <Box flex="1" py={5} px={[2, 5, 10]}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route 
                  path="/routine-planner" 
                  element={
                    <PrivateRoute>
                      <RoutinePlanner />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
