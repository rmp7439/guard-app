import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TextInput,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Screen } from "../../components/ui/Screen";
import { Button } from "../../components/ui/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { radius } from "../../theme/radius";
import { typography } from "../../theme/typography";
import { DEMO_OTP } from "../../constants/validation";
import { AuthService } from "../../services/auth/auth.service";
import { useAuth } from "../../features/auth/contexts/AuthContext";

export default function OTPScreen() {
  const router = useRouter();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const { login } = useAuth();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const errorOpacity = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);

  const otpString = otp.join("");
  const isButtonDisabled = otpString.length !== 6 || isLoading;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      errorOpacity.setValue(0);
    }
  }, [error, errorOpacity]);

  const handleOtpChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");

    if (cleanText.length > 1) {
      const chars = cleanText.split("").slice(0, 6);
      const newOtp = ["", "", "", "", "", ""];
      chars.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      if (error) setError("");

      const nextFocus = Math.min(chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);
    if (error) setError("");

    if (cleanText !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    setError("");

    if (otpString !== DEMO_OTP) {
      setError(`Invalid OTP`);
      return;
    }

    setIsLoading(true);

    try {
      const mobileNumber = Array.isArray(mobile) ? mobile[0] : mobile || "";
      const response = await AuthService.verifyOtp({
        mobile: mobileNumber,
        otp: otpString,
      });

      if (isMounted.current) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        login(response.user, response.token);
        router.replace("/(guard)/home");
      }
    } catch (err) {
      if (isMounted.current) {
        const message =
          err instanceof Error
            ? err.message
            : "Invalid OTP entered. Please try again.";
        setError(message);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <Screen
      contentContainerStyle={styles.container}
      backgroundColor={colors.background}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>LOGO</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to{"\n"}
            <Text style={styles.boldText}>
              {mobile ? `+91 ${mobile}` : "your mobile number"}
            </Text>
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>One Time Password</Text>
          <View style={styles.otpRow}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  focusedIndex === index && styles.otpBoxFocused,
                  error ? styles.otpBoxError : null,
                ]}
                placeholder="_"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={6}
                value={otp[index]}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                editable={!isLoading}
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>
          <Animated.Text style={[styles.errorText, { opacity: errorOpacity }]}>
            {error || " "}
          </Animated.Text>
        </View>

        <Button
          title="Verify & Login"
          onPress={handleVerify}
          disabled={isButtonDisabled}
          loading={isLoading}
          style={styles.buttonSpacing}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: colors.logoBackground,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
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
  boldText: {
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  inputContainer: {
    width: "100%",
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
    marginBottom: 6,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: spacing.xs,
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.inputBackground,
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  otpBoxError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.size.sm,
    marginTop: spacing.sm,
    paddingHorizontal: 2,
  },
  buttonSpacing: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxxl,
  },
});
