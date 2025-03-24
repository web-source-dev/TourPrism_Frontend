import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, CardMedia } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { register, googleLogin, verifyOTP, resendOTP } from '../services/api';

const SignUp = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/feed');
    }
  }, [navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    otp: '',
    submit: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    otp: ['', '', '', '', '', '']
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', submit: '' };

    if (!formData.email) {
      newErrors.email = 'Email field is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password field is required.';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
      isValid = false;
    }

    if (!formData.rememberMe) {
      newErrors.submit = 'Please agree to the terms and conditions.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOTP = [...formData.otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOTP[index] = char;
    });
    setFormData(prev => ({ ...prev, otp: newOTP }));
  }
  // Add this new function to handle OTP input
  const handleOTPChange = (index, value) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...formData.otp];
    newOTP[index] = value;
    setFormData(prev => ({
      ...prev,
      otp: newOTP
    }));

    // Move to next input if value is entered
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) {
        prevInput.focus();
        // Clear the previous input
        const newOTP = [...formData.otp];
        newOTP[index - 1] = '';
        setFormData(prev => ({ ...prev, otp: newOTP }));
      }
    }
    // Handle left arrow
    else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) prevInput.focus();
    }
    // Handle right arrow
    else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  // Modify validateOTP function
  const validateOTP = () => {
    const otpString = formData.otp.join('');
    if (!otpString) {
      setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
      return false;
    }
    if (!/^\d{6}$/.test(otpString)) {
      setErrors(prev => ({ ...prev, otp: 'OTP must be 6 digits' }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, submit: '' }));

    if (step === 1 && validateForm()) {
      setIsLoading(true);
      try {
        const response = await register(formData);
        setUserId(response.userId);
        setStep(2);
        setTimer(60);
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Registration failed'
        }));
      } finally {
        setIsLoading(false);
      }
    } // In handleSubmit function, modify the step 2 verification part
    else if (step === 2 && validateOTP()) {
      setIsLoading(true);
      try {
        const response = await verifyOTP({ 
          userId, 
          otp: formData.otp.join('') // Join the array to create a string
        });
        // User will be automatically logged in as verifyOTP now sets the token
        navigate('/feed'); // Changed from '/' to '/feed'
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          otp: error.message || 'Invalid OTP'
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Add new state for resend loading
  const [isResending, setIsResending] = useState(false);
  
  // Update handleResendOTP function
  const handleResendOTP = async () => {
    if (timer === 0) {
      setIsResending(true);
      try {
        await resendOTP({ userId });
        setTimer(60);
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Failed to resend OTP'
        }));
      } finally {
        setIsResending(false);
      }
    }
  };
  
  // Update the verify button
  <Button
    type="submit"
    fullWidth
    variant="contained"
    disabled={isLoading || isResending}
    sx={{
      mt: 3,
      mb: 2,
      bgcolor: 'black',
      borderRadius: '8px',
      py: 1.5,
      '&:hover': {
        bgcolor: '#333',
      },
    }}
  >
    {(isLoading || isResending) ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} color="inherit" />
        <span>{isResending ? 'Resending...' : (step === 1 ? 'Signing up...' : 'Verifying...')}</span>
      </Box>
    ) : (
      step === 1 ? 'Sign Up' : 'Verify'
    )}
  </Button>

  const handleGoogleSignUp = () => {
    googleLogin();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '400px',
        margin: '0 auto',
        padding: '1rem',
        pt: '3rem'
      }}
    >
     

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {step === 1 ? (
          <>

<Typography
        component="h1"
        variant="h5"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 5, fontWeight: 'bold', fontSize: '24px' }}
      >
        <span style={{ color: '#0066FF' }}>t</span> tourprism
      </Typography>
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'gray' }}>
                <i className="ri-mail-line"></i>
              </span>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 45px',
                  borderRadius: '8px',
                  border: errors.email ? '1px solid #d32f2f' : '1px solid rgb(202, 202, 202)',
                  backgroundColor: isLoading ? '#f5f5f5' : '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {errors.email && (
              <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <i className="ri-information-line"></i> {errors.email}
              </Typography>
            )}

            <div style={{ position: 'relative', width: '100%', marginTop: '10px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'gray' }}>
                <i className="ri-lock-2-line"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 45px 10px 45px',
                  borderRadius: '8px',
                  border: errors.password ? '1px solid #d32f2f' : '1px solid rgb(202, 202, 202)',
                  backgroundColor: isLoading ? '#f5f5f5' : '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                <i className={showPassword ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
              </button>
            </div>
            {errors.password && (
              <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <i className="ri-information-line"></i> {errors.password}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
                style={{ marginRight: '8px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: isLoading ? 0.7 : 1 }}>
                I agree to Tourprism's <Link to="/terms" style={{ color: '#000', textDecoration: 'underline', pointerEvents: isLoading ? 'none' : 'auto' }}>terms of use</Link> and{' '}
                <Link to="/privacy" style={{ color: '#000', textDecoration: 'underline', pointerEvents: isLoading ? 'none' : 'auto' }}>privacy policy</Link>
              </Typography>
            </Box>
            {errors.submit && (
              <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <i className="ri-information-line"></i> {errors.submit}
              </Typography>
            )}
          </>
        ) : (
          <div style={{ position: 'relative', width: '100%' }}>
            <CardMedia
              component="img"
              image="/images/verify-email.png"
              alt="OTP"
              sx={{ width: '100%', maxWidth: 90, margin: '40px auto', display: 'block' }}
            />
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
              Please enter the 6-digit code sent to {formData.email}
            </Typography>
            
         
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', my: 3 }}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  name={`otp-${index}`}
                  value={formData.otp[index]}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(e, index)}
                  onPaste={handleOTPPaste}
                  maxLength={1}
                  disabled={isLoading}
                  style={{
                    width: '45px',
                    height: '45px',
                    textAlign: 'center',
                    fontSize: '20px',
                    borderRadius: '8px',
                    border: errors.otp ? '1px solid #d32f2f' : '1px solid rgb(202, 202, 202)',
                    backgroundColor: isLoading ? '#f5f5f5' : '#fff',
                    outline: 'none',
                    cursor: 'text',
                  }}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </Box>
            
            {errors.otp && (
              <Typography variant="body2" color="error" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mt: 1,
                justifyContent: 'center' 
              }}>
                <i className="ri-information-line"></i> {errors.otp}
              </Typography>
            )}
            
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              Didn't get the email? {' '}
              <Button
                onClick={handleResendOTP}
                disabled={timer > 0 || isLoading}
                sx={{ 
                  textTransform: 'none', 
                  p: 0, 
                  minWidth: 'auto',
                  color: timer > 0 ? 'text.disabled' : 'primary.main'
                }}
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Button>
            </Typography>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{
            mt: 3,
            mb: 2,
            bgcolor: 'black',
            borderRadius: '8px',
            py: 1.5,
            '&:hover': {
              bgcolor: '#333',
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>{step === 1 ? 'Signing up...' : 'Verifying...'}</span>
            </Box>
          ) : (
            step === 1 ? 'Sign Up' : 'Verify'
          )}
        </Button>

        {step === 1 && (
          <>
            <Link
              to="/login"
              style={{
                display: 'block',
                textAlign: 'center',
                marginBottom: '1rem',
                color: '#0066FF',
                textDecoration: 'none',
                pointerEvents: isLoading ? 'none' : 'auto',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              Login
            </Link>

            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Box sx={{ flex: 1, borderBottom: '1px solid #ccc' }} />
              <Typography variant="body2" align="center" sx={{ mx: 2, whiteSpace: 'nowrap' }}>
                OR
              </Typography>
              <Box sx={{ flex: 1, borderBottom: '1px solid #ccc' }} />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<img src="/images/pngwing.png" alt="Google" width="25" />}
              onClick={handleGoogleSignUp}
              sx={{
                mb: 2,
                borderRadius: 8,
                py: 1.5,
                borderColor: '#E0E0E0',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#BDBDBD',
                  bgcolor: '#F5F5F5'
                }
              }}
            >
              Continue with Google
            </Button>
          </>
        )}
      </form>
    </Box>
  );
};

export default SignUp;