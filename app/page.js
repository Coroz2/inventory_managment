'use client';
import Image from "next/image";
import React, { useState, useRef, useEffect } from 'react';
import { Camera } from "react-camera-pro";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography, createTheme, ThemeProvider } from '@mui/material';
import { collection, getDocs, query, getDoc, doc, deleteDoc, setDoc } from "firebase/firestore";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#ffffff',
  border: 'none',
  borderRadius: 8,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  color: 'black',
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    alternative: {
      main: '#388e3c',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000',
      secondary: '#555',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.MuiButton-containedAlternative': {
            backgroundColor: '#388e3c',
            color: 'black', // Set text color to black
            '&:hover': {
              backgroundColor: '#2e7d32', // Slightly darker green for hover effect
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const RecipeDisplay = ({ recipe }) => {
  return (
    <Box
      width="80%"
      bgcolor="#ffffff"
      borderRadius={8}
      boxShadow={3}
      p={4}
      mt={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
    >
      <Typography variant="h5" color="text.primary" textAlign="center" fontWeight="bold">
        Suggested Recipe
      </Typography>
      <Typography variant="body1" color="text.primary">
        {recipe}
      </Typography>
    </Box>
  );
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const cameraRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [recipe, setRecipe] = useState(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessageToOpenAI = async () => {
    const ingredientsList = inventory.map(item => item.name).join(", ");
    const userMessage = `Here is the list of items in my pantry: ${ingredientsList}. Can you suggest a recipe using these ingredients? Respond with a just the recipe do not make it seem like you are talking to me.`;

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMessage }] }),
      });

      const data = await response.json();
      console.log('Response from OpenAI:', data);
      setRecipe(data.result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTakePhoto = () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.takePhoto();
      setImage(photo);
      setIsCameraOpen(false); // Close the camera after taking the photo
    }
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        bgcolor="background.default"
        color="text.primary"
        p={4}
      >
        <Modal
          open={isCameraOpen}
          onClose={handleCloseCamera}
          aria-labelledby="camera-modal-title"
          aria-describedby="camera-modal-description"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            p={2}
            bgcolor="background.paper"
            borderRadius={2}
            boxShadow={3}
            maxWidth={400}
            mx="auto"
          >
            <Typography variant="h6" color="text.primary" id="camera-modal-title">
              Take a Photo
            </Typography>
            <Camera ref={cameraRef} aspectRatio={4 / 3} />
            <Stack direction="row" spacing={2} width="100%">
              <Button variant="contained" onClick={handleTakePhoto} fullWidth>
                Take Photo
              </Button>
              <Button variant="contained" color="secondary" onClick={handleCloseCamera} fullWidth>
                Close
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>
          <Button
            variant="contained"
            color="alternative"
            sx={{ color: 'black' }} // Ensure text color is black
            onClick={handleOpenCamera}
          >
            Add with image
          </Button>
        </Stack>
        <TextField
          id="search-bar"
          label="Search"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '1200px', marginBottom: '20px' }}
        />
        <Box border={'1px solid #ddd'} borderRadius={4} overflow="hidden" boxShadow={3}>
          <Box
            width="1200px"
            height="100px"
            bgcolor={'#ffffff'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant={'h4'} color={'#000'} textAlign={'center'} fontWeight="bold">
              My Pantry
            </Typography>
          </Box>
          <Stack width="1200px" maxHeight="300px" spacing={2} overflow={'auto'} p={2}>
            {filteredInventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                minHeight="100px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#f5f5f5'}
                paddingX={3}
                borderRadius={2}
                boxShadow={2}
              >
                <Typography variant={'h6'} color={'#000'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'h6'} color={'#000'}>
                  Quantity: {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="primary" onClick={() => addItem(name)}>
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => removeItem(name)}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
        {image && <img src={image} alt="Taken photo" />}
        <Button variant="contained" onClick={sendMessageToOpenAI}>
          Get Recipe from OpenAI
        </Button>
        {recipe && <RecipeDisplay recipe={recipe} />}
      </Box>
    </ThemeProvider>
  );
}
