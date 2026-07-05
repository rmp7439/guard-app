import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { MOBILE_REGEX } from '../../constants/validation';
import { AuthService } from '../../services/auth/auth.service';

export default function LoginScreen() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isButtonDisabled = mobileNumber.length !== 10 || isLoading;

  const handleContinue = async () => {
    Keyboard.dismiss();
    setError('');

    if (!MOBILE_REGEX.test(mobileNumber)) {
      setError('Please enter a valid Indian mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      // Delegate validation entirely to the service to mock backend behavior
      await AuthService.sendOtp(mobileNumber);
      
      router.push({
        pathname: '/(auth)/otp',
        params: { mobile: mobileNumber },
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
            error={error}
          />
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
    marginBottom: spacing.md,
  },
  buttonSpacing: {
    marginTop: spacing.sm,
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