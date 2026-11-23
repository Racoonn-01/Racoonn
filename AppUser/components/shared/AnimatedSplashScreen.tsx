import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export default function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
  // Shared Values for Animation
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Logo fades and scales in with a clean, smooth spring
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 100 });

    // 2. Smooth Screen Fade Out Exit
    const timer = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) }, () => {
        runOnJS(onAnimationFinish)();
      });
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAnimationFinish]);

  // Animated Styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
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
            resizeMode="contain"
          />
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
    width: 140,
    height: 140,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});

