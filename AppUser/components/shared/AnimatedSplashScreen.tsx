import React, { useEffect } from 'react';
import { StyleSheet, View, Text, StatusBar, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export default function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
  // Shared Values for Animation
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Logo fades and scales in with a clean, smooth spring
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 100 });

    // 2. Brand Text slides up cleanly after a short delay
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 14, stiffness: 100 }));

    // 3. Smooth Screen Fade Out Exit
    const timer = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) }, () => {
        runOnJS(onAnimationFinish)();
      });
    }, 2400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAnimationFinish]);

  // Animated Styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.centerContent}>
        {/* Minimal Animated Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Minimal Animated Brand Text */}
        <Animated.View style={[styles.brandTextWrapper, textStyle]}>
          <Text style={styles.brandTitle}>RACOONN</Text>
          <View style={styles.accentLine} />
          <Text style={styles.taglineText}>HOTEL BOOKING</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 24, // Slight rounding for a clean modern app icon look
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 32,
    // Removed all shadows/glows for a flat, clean aesthetic
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTextWrapper: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Black',
    color: '#0F172A',
    letterSpacing: 6,
    marginBottom: 10,
  },
  accentLine: {
    height: 2,
    width: 60,
    backgroundColor: Colors.brand.coral,
    borderRadius: 1,
    marginBottom: 10,
  },
  taglineText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#64748B',
    letterSpacing: 3,
  },
});
