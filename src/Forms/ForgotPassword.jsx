import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress,TextField,InputAdornment,IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";

import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyResetOTP, resetPassword, resendResetOTP } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/feed');
    }
  }, [navigate]);

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Add new useEffect to clear errors on step change
  React.useEffect(() => {
    setErrors({});
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    return true;
  };

  const validateOTP = () => {
    if (!formData.otp) {
      setErrors((prev) => ({ ...prev, otp: 'OTP is required' }));
      return false;
    }
    if (!/^\d{6}$/.test(formData.otp)) {
      setErrors((prev) => ({ ...prev, otp: 'OTP must be 6 digits' }));
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!formData.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
      return false;
    }
    if (formData.newPassword.length < 6) {
      setErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 6 characters' }));
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      setErrors((prev) => ({ ...prev, newPassword: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }));
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return false;
    }
    return true;
  };

  const handleResendOTP = async () => {
    if (timer === 0) {
      setIsLoading(true);
      try {
        await resendResetOTP({ userId });
        setTimer(60);
        // Clear any previous errors
        setErrors((prev) => ({ ...prev, submit: '', otp: '' }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || 'Failed to resend OTP. Please try again.'
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (validateEmail()) {
      setIsLoading(true);
      try {
        const response = await forgotPassword({ email: formData.email });
        setUserId(response.userId);
        setStep(2);
        setTimer(60);
      } catch (error) {
        setErrors((prev) => ({ ...prev, submit: error.message || 'Failed to send reset email' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitOTP = async (e) => {
    e.preventDefault();
    if (validateOTP()) {
      setIsLoading(true);
      try {
        await verifyResetOTP({ userId, otp: formData.otp });
        setStep(3);
        setTimer(60);
      } catch (error) {
        setErrors((prev) => ({ ...prev, submit: error.message || 'Invalid OTP' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (validatePassword()) {
      setIsLoading(true);
      try {
        await resetPassword({
          userId,
          otp: formData.otp,
          newPassword: formData.newPassword
        });
        navigate('/login');
      } catch (error) {
        setErrors((prev) => ({ ...prev, submit: error.message || 'Failed to reset password' }));
      } finally {
        setIsLoading(false);
      }
    }
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
     

      <form onSubmit={step === 1 ? handleSubmitEmail : step === 2 ? handleSubmitOTP : handleSubmitPassword} style={{ width: '100%' }}>
        {step === 1 && (
          <>
        <Typography
        component="h1"
        variant="h5"
        sx={{ display: 'flex', alignItems: 'center',justifyContent:"center", gap: 1, mb: 5, fontSize: '24px' }}
      >
        <span style={{ color: '#0066FF',fontSize:"28px" ,fontWeight:'bold'}}>t</span> tourprism
      </Typography>
       <div style={{ position: 'relative', width: '100%' }}>
       {/* Email Icon */}
       <span style={{
         position: 'absolute',
         left: '12px',
         top: '50%',
         transform: 'translateY(-50%)',
         fontSize: '18px',
         color: 'gray'
       }}>
         <i className="ri-mail-line"></i>
       </span>
     
       {/* Email Input */}
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
           cursor: isLoading ? 'not-allowed' : 'text',
           height: '45px',  // 👈 Ensures consistent height
         }}
       />
     
       {/* Error Message (Positioned Absolutely to Prevent Input Shifting) */}
       {errors.email && (
         <div style={{
           position: 'absolute',
           top: '50px',  // 👈 Keeps input in the same position
           left: '0',
           color: '#d32f2f',
           fontSize: '14px',
           display: 'flex',
           alignItems: 'center',
         }}>
           <i className="ri-information-line" style={{ marginRight: '5px' }}></i>
           {errors.email}
         </div>
       )}
     </div>
     </>
      
        )}

        {step === 2 && (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <img src="/images/verify-email.png" alt="Verify Email" style={{ width: '64px', height: '64px', marginBottom: '16px' }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Verify your email address
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To verify your email address please enter the 6-digit code sent to {formData.email}
              </Typography>
            </Box>

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                name="otp"
                placeholder="******"
                value={formData.otp}
                onChange={handleChange}
                maxLength={6}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.otp ? '1px solid #d32f2f' : '1px solid rgb(202, 202, 202)',
                  backgroundColor: isLoading ? '#f5f5f5' : '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  height: '45px',
                }}
              />

              {errors.otp && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  left: '0',
                  color: '#d32f2f',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'center'
                }}>
                  <i className="ri-information-line" style={{ marginRight: '5px' }}></i>
                  {errors.otp}
                </div>
              )}
            </div>

            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
              Didn't get the email? <button
                onClick={handleResendOTP}
                disabled={timer > 0 || isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: timer > 0 ? 'gray' : '#000',
                  cursor: timer > 0 || isLoading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  font: 'inherit',
                  textDecoration: 'underline'
                }}
              >
                {timer > 0 ? `Please check your spam. Resend Code (${timer}s)` : 'Resend Code'}
              </button>
            </Typography>
          </>
        )}

        {step === 3 && (
          <>
      <Typography
        component="h1"
        variant="h5"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 1,
          mb: 5,
          fontWeight: "bold",
          fontSize: "24px",
        }}
      >
        <span style={{ color: "#0066FF" }}>t</span> tourprism
      </Typography>

      {["newPassword", "confirmPassword"].map((field, index) => (
        <TextField
          key={field}
          type={showPassword ? "text" : "password"}
          name={field}
          label={field === "newPassword" ? "New Password" : "Confirm Password"}
          value={formData[field]}
          onChange={handleChange}
          disabled={isLoading}
          error={Boolean(errors[field])}
          helperText={errors[field]}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ mb: index === 0 ? 2 : 0 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="disabled" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ))}
    </>
        )}

        {errors.submit && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            <i className="ri-information-line"></i> {errors.submit}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{
            mt: 5,
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
              <span>
                {step === 1 ? 'Sending...' : step === 2 ? 'Verifying...' : 'Resetting...'}
              </span>
            </Box>
          ) : (
            step === 1 ? 'Send Reset Link' : step === 2 ? 'Verify OTP' : 'Reset Password'
          )}
        </Button>

        <Link to="/login" style={{ display: 'block', textAlign: 'center', color: '#0066FF', textDecoration: 'none' }}>
          Back to Login
        </Link>
      </form>
    </Box>
  );
};

export default ForgotPassword;