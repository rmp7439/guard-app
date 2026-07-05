import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
  Animated,
  RefreshControl,
  Keyboard,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  contentContainerStyle?: ViewStyle | ViewStyle[];
  scrollable?: boolean;
  backgroundColor?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function Screen({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
  backgroundColor = colors.background,
  onRefresh,
  refreshing = false,
}: ScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
    />
  ) : undefined;

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      overScrollMode="never"
    >
      {children}
    </ScrollView>
  ) : (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
       <View style={[styles.scrollContent, contentContainerStyle]}>
          {children}
       </View>
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={[styles.keyboardAvoid, style]}
        // Behavior padding is safer on iOS; Android natively resizes window better
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {content}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});