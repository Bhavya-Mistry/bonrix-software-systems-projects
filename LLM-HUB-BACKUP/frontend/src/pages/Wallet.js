import React, { useState, useEffect } from 'react';
import TaskHistory from '../components/TaskHistory';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

// API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Wallet = () => {
  const { user, updateUserCredits } = useAuth();
  
  // State for transactions and loading
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  
  // State for payment dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch transactions
        const transactionsResponse = await axios.get(`${API_URL}/users/transactions`);
        setTransactions(transactionsResponse.data);
        
        // Fetch credit packages
        const packagesResponse = await axios.get(`${API_URL}/api/payment/packages`);
        setPackages(packagesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Handle buy credits
  const handleBuyCredits = (packageData) => {
    setSelectedPackage(packageData);
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPackage(null);
    setPaymentMethod('stripe');
    setPaymentError('');
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };
  
  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedPackage) return;
    
    setPaymentLoading(true);
    setPaymentError('');
    
    try {
      if (paymentMethod === 'stripe') {
        // Create Stripe payment intent
        const response = await axios.post(
          `${API_URL}/api/payment/stripe/create-intent`,
          new URLSearchParams({
            package_id: selectedPackage.id,
            currency: 'inr'
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        // In a real app, we would use Stripe.js to handle the payment
        // For this demo, we'll simulate a successful payment
        
        // Verify the payment
        const verifyResponse = await axios.post(
          `${API_URL}/api/payment/stripe/verify`,
          new URLSearchParams({
            payment_intent_id: response.data.payment_id
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        // Update user credits
        if (verifyResponse.data.success) {
          updateUserCredits(user.credits + verifyResponse.data.credits_added);
          
          // Fetch updated transactions
          const transactionsResponse = await axios.get(`${API_URL}/users/transactions`);
          setTransactions(transactionsResponse.data);
          
          handleCloseDialog();
        } else {
          setPaymentError('Payment verification failed. Please try again.');
        }
      } else if (paymentMethod === 'razorpay') {
        // Create Razorpay order
        const response = await axios.post(
          `${API_URL}/api/payment/razorpay/create-order`,
          new URLSearchParams({
            package_id: selectedPackage.id
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        // In a real app, we would use Razorpay.js to handle the payment
        // For this demo, we'll simulate a successful payment
        
        // Verify the payment
        const verifyResponse = await axios.post(
          `${API_URL}/api/payment/razorpay/verify`,
          new URLSearchParams({
            order_id: response.data.order_id,
            payment_id: 'pay_demo123456',
            signature: 'sig_demo123456'
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        // Update user credits
        if (verifyResponse.data.success) {
          updateUserCredits(user.credits + verifyResponse.data.credits_added);
          
          // Fetch updated transactions
          const transactionsResponse = await axios.get(`${API_URL}/users/transactions`);
          setTransactions(transactionsResponse.data);
          
          handleCloseDialog();
        } else {
          setPaymentError('Payment verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An error occurred during payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ p: 3 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Current Credits */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" gutterBottom>
                  Your Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current balance and credit packages
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  {user.credits}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Available Credits
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          {/* Credit Packages */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Credit Packages
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {packages.map((pkg) => (
              <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {pkg.credits} Credits
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      ₹{pkg.price_inr}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      ${pkg.price_usd} USD
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      onClick={() => handleBuyCredits(pkg)}
                    >
                      Buy Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Transaction History */}
          <Box sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" gutterBottom>
                Transaction History
              </Typography>
              <Button
                component={Link}
                to="/statement"
                variant="outlined"
                color="primary"
                startIcon={<ReceiptLongIcon />}
                sx={{ mb: 2 }}
              >
                View Statement
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              View your credit purchase history and detailed statement
            </Typography>
            
            {transactions.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                        <TableCell>+{transaction.amount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.method} 
                            size="small" 
                            color={transaction.method === 'admin_assignment' ? 'secondary' : 'primary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.status} 
                            size="small" 
                            color={transaction.status === 'completed' ? 'success' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper elevation={1} sx={{ p: 2 }}>
                <List>
                  <ListItem>
                    <ListItemText primary="No transactions yet" secondary="Purchase credits to get started" />
                  </ListItem>
                </List>
              </Paper>
            )}
          </Box>
          
          {/* Task History in Bank Statement Format */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Task History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            View your previous tasks and credit usage in a bank statement format
          </Typography>
          
          <TaskHistory />
          
          {/* Payment Information */}
          <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              About Credits
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              Credits are used to pay for AI tasks in Windsurf. Different tasks and models have different credit costs.
            </Typography>
            <Typography variant="body2" paragraph>
              For example, GPT-4 costs 30 credits per 1K tokens, while GPT-3.5 costs 5 credits per 1K tokens.
            </Typography>
            <Typography variant="body2">
              You can purchase credits using Stripe or Razorpay. All transactions are secure and processed immediately.
            </Typography>
          </Paper>
          
          {/* Payment Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>
              {selectedPackage ? `Buy ${selectedPackage.credits} Credits` : 'Buy Credits'}
            </DialogTitle>
            <DialogContent>
              {paymentError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {paymentError}
                </Alert>
              )}
              
              {selectedPackage ? (
                <Box>
                  <Typography variant="body1" paragraph>
                    You are purchasing {selectedPackage.credits} credits for ₹{selectedPackage.price_inr}.
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Select Payment Method
                  </Typography>
                  
                  <RadioGroup
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    <FormControlLabel value="stripe" control={<Radio />} label="Credit/Debit Card (Stripe)" />
                    <FormControlLabel value="razorpay" control={<Radio />} label="UPI/Netbanking (Razorpay)" />
                  </RadioGroup>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {packages.map((pkg) => (
                    <Grid item xs={12} sm={6} key={pkg.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {pkg.credits} Credits
                          </Typography>
                          <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            ₹{pkg.price_inr}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            fullWidth 
                            variant="outlined"
                            onClick={() => setSelectedPackage(pkg)}
                          >
                            Select
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              {selectedPackage && (
                <Button 
                  onClick={handlePayment} 
                  variant="contained"
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Processing...' : 'Pay Now'}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default Wallet;
