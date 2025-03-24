import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert ,CardMedia} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, googleLogin, verifyOTP, resendOTP } from '../services/api';


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [timer, setTimer] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ['', '', '', '', '', '']
  });

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOTP = [...formData.otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOTP[index] = char;
    });
    setFormData(prev => ({ ...prev, otp: newOTP }));
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...formData.otp];
    newOTP[index] = value;
    setFormData(prev => ({
      ...prev,
      otp: newOTP
    }));

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) {
        prevInput.focus();
        const newOTP = [...formData.otp];
        newOTP[index - 1] = '';
        setFormData(prev => ({ ...prev, otp: newOTP }));
      }
    }
    else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) prevInput.focus();
    }
    else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/feed');
    }
  }, [navigate]);

  useEffect(() => {
    // Check if we were redirected from the alert form
    if (location.state && location.state.from === '/post-alert') {
      setRedirectMessage(location.state.message || 'Please login to post an alert');
    }
  }, [location]);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    submit: ''
  });
  const [redirectMessage, setRedirectMessage] = useState('');

  useEffect(() => {
    // Check if we were redirected from the alert form
    if (location.state && location.state.from === '/post-alert') {
      setRedirectMessage(location.state.message || 'Please login to post an alert');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', submit: '' };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

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

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOTP = async () => {
    if (timer === 0) {
      setIsLoading(true);
      try {
        await resendOTP({ userId });
        setTimer(60);
        setErrors(prev => ({ ...prev, submit: '', otp: '' }));
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Failed to resend OTP'
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, submit: '' }));

    if (step === 1 && validateForm()) {
      setIsLoading(true);
      try {
        const response = await login(formData);
        if (response.needsVerification) {
          setUserId(response.userId);
          setStep(2);
          setTimer(60);
        } else {
          if (location.state && location.state.from) {
            navigate(location.state.from);
          } else {
            navigate('/feed');
          }
        }
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Invalid email or password'
        }));
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2 && validateOTP()) {
      setIsLoading(true);
      try {
        await verifyOTP({ userId, otp: formData.otp.join('') });
        if (location.state && location.state.from) {
          navigate(location.state.from);
        } else {
          navigate('/');
        }
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

  const handleGoogleLogin = () => {
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
        pt: '5rem',
      }}
    >
      <Typography
        component="h1"
        variant="h5"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 5, fontWeight: 'bold', fontSize: '24px' }}
      >
        <span style={{ color: '#0066FF' }}>t</span> tourprism
      </Typography>

      {redirectMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {redirectMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {step === 1 ? (
          <>
            {/* Email Input */}
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

        {/* Password Input */}
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
          <Box sx={{ flexGrow: errors.password ? 1 : 0 }}>
            {errors.password && (
              <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-information-line"></i> {errors.password}
              </Typography>
            )}
          </Box>

          <Link 
            to="/forgot-password" 
            style={{ 
              color: '#000', 
              textDecoration: 'underline', 
              fontSize: '0.875rem',
              pointerEvents: isLoading ? 'none' : 'auto',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            Forgot Password?
          </Link>
        </Box>

        {errors.submit && (
          <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <i className="ri-information-line"></i> {errors.submit}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{
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
              <span>Logging in...</span>
            </Box>
          ) : (
            'Login'
          )}
        </Button>

        <Link 
          to="/signup" 
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
          Sign Up
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <Box sx={{ flex: 1, borderBottom: '1px solid #ccc' }} />
          <Typography variant="body2" align="center" sx={{ mx: 2, whiteSpace: 'nowrap' }}>
            OR
          </Typography>
          <Box sx={{ flex: 1, borderBottom: '1px solid #ccc' }} />
        </Box>

        <Box>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/images/pngwing.png" alt="Google" width="25" />}
            onClick={handleGoogleLogin}
            disabled={isLoading}
            sx={{
              mb: 2,
              borderRadius: 8,
              py: 1.5,
              borderColor: '#E0E0E0',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#BDBDBD',
                bgcolor: '#F5F5F5',
              },
            }}
          >
            Continue with Google
          </Button>
        </Box>
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
              <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <i className="ri-information-line"></i> {errors.otp}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              Didn't receive the code?{' '}
              <Button
                onClick={handleResendOTP}
                disabled={timer > 0 || isLoading}
                sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
              </Button>
            </Typography>

            {/* Add Verify OTP Button */}
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
                  <span>Verifying...</span>
                </Box>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        )}
      </form>
    </Box>
  );
};

export default Login;


