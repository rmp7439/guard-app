import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Keyboard, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { DEMO_MOBILE } from '../../constants/validation';
import { AuthService } from '../../services/auth/auth.service';

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const errorOpacity = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);

  const isButtonDisabled = mobileNumber.length !== 10 || isLoading;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      errorOpacity.setValue(0);
    }
  }, [error, errorOpacity]);

  const handleContinue = async () => {
    Keyboard.dismiss();
    setError('');

    if (mobileNumber !== DEMO_MOBILE) {
      setError(`Invalid mobile number. Please use the demo number ${DEMO_MOBILE}.`);
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.sendOtp(mobileNumber);
      if (isMounted.current) {
        router.push({
          pathname: '/(auth)/otp',
          params: { mobile: mobileNumber },
        });
      }
    } catch (err) {
      if (isMounted.current) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <Screen contentContainerStyle={styles.container} backgroundColor={colors.background}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>LOGO</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
        </View>

        <View style={styles.inputContainer}>
          <Input
            label="Mobile Number"
            prefix="+91"
            placeholder="Enter mobile number"
            keyboardType="numeric"
            maxLength={10}
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text.replace(/[^0-9]/g, ''));
              if (error) setError('');
            }}
            editable={!isLoading}
            error={error ? ' ' : undefined} 
          />
          
          <Animated.Text style={[styles.errorBanner, { opacity: errorOpacity }]}>
            {error}
          </Animated.Text>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={isButtonDisabled}
          loading={isLoading}
          style={styles.buttonSpacing}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to our </Text>
          <View style={styles.footerLinks}>
            <Pressable hitSlop={10}><Text style={styles.linkText}>Terms of Service</Text></Pressable>
            <Text style={styles.footerText}> and </Text>
            <Pressable hitSlop={10}><Text style={styles.linkText}>Privacy Policy</Text></Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: colors.logoBackground,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    letterSpacing: 1,
  },
  headerContainer: {
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.size.headline,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  errorBanner: {
    color: colors.error,
    fontSize: typography.size.sm,
    paddingHorizontal: 4,
    marginTop: -8, 
  },
  buttonSpacing: {
    marginTop: spacing.md,
    marginBottom: spacing.xxxl,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  footerText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: typography.size.sm,
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
});