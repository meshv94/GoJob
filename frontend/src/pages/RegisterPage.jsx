import React, { useState, useEffect } from 'react';
import { register, sendOtp, verifyOtp } from '../api/auth';
import { useHistory } from 'react-router-dom';
import { Card, Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { CircleLoader } from 'react-spinners';
import axios from 'axios';

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(600); // 600 seconds = 10 minutes
  const [canResend, setCanResend] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [otpTimer]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      history.push('/');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/auth/send-otp', { email: form.email });
      // await sendOtp(form.email);
      setOtpTimer(600); // Reset timer
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg p-3 mb-5 bg-white rounded">
              <Card.Body>
                <h2 className="text-center mb-4">Register</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? (
                  <div className="d-flex justify-content-center my-4">
                    <CircleLoader color="#007bff" size={80} />
                  </div>
                ) : step === 1 ? (
                  <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      as={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                    >
                      Register & Send OTP
                    </Button>
                  </Form>
                ) : (
                  <Form onSubmit={handleVerifyOtp}>
                    <Form.Group className="mb-3">
                      <Form.Label>Enter OTP sent to your email</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Button
                      variant="success"
                      type="submit"
                      className="w-100"
                      as={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                    >
                      Verify OTP
                    </Button>
                  </Form>
                )}
                {step === 2 && (
                  <div className="text-center mt-3">
                    {otpTimer > 0 ? (
                      <div>
                        <span>OTP expires in: {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</span>
                      </div>
                    ) : (
                      <Button onClick={handleResendOtp} disabled={!canResend}>
                        Resend OTP
                      </Button>
                    )}
                  </div>
                )}
                <div className="text-center mt-3">
                  <a href="/">Already have an account? Login</a>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;