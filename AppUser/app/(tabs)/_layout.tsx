import React from 'react';
import { StyleSheet, View, Platform, Text, Pressable, useWindowDimensions, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Heart, Ticket, User } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 10);
  const barHeight = isTablet ? 84 + bottomInset : 70 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.coral,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarButton: ({ ref, style, children, ...props }) => (
          <Pressable
            {...props}
            android_ripple={null}
            style={({ pressed }) => [
              style as any,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            {children}
          </Pressable>
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: isTablet ? (windowWidth - 560) / 2 : 0,
          right: isTablet ? (windowWidth - 560) / 2 : 0,
          width: isTablet ? 560 : '100%',
          height: barHeight,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderBottomLeftRadius: isTablet ? 30 : 0,
          borderBottomRightRadius: isTablet ? 30 : 0,
          marginBottom: isTablet ? 12 : 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderColor: 'rgba(226, 232, 240, 0.7)',
          paddingBottom: bottomInset,
          paddingTop: 10,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 3,
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 12.5 : 11,
          fontWeight: '600',
          marginTop: 3,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Home
                color={focused ? '#FFFFFF' : '#94A3B8'}
                fill="transparent"
                strokeWidth={2.2}
                size={isTablet ? 22 : 19}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.labelActive]}>Home</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="packages"
        options={{
          title: 'Packages',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ticket
                color={focused ? '#FFFFFF' : '#94A3B8'}
                fill="transparent"
                strokeWidth={2.2}
                size={isTablet ? 22 : 19}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.labelActive]}>Packages</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="ai"
        options={{
          title: 'Ask AI',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.askAiIconContainer, focused && styles.askAiIconContainerActive]}>
              <Image
                source={require('@/assets/images/racoon-favicon.jpg')}
                style={styles.mascotImg}
                resizeMode="cover"
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.labelActive]}>Ask AI</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="two"
        options={{
          title: 'Favorite',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Heart
                color={focused ? '#FFFFFF' : '#94A3B8'}
                fill="transparent"
                strokeWidth={2.2}
                size={isTablet ? 22 : 19}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.labelActive]}>Favorite</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <User
                color={focused ? '#FFFFFF' : '#94A3B8'}
                fill="transparent"
                strokeWidth={2.2}
                size={isTablet ? 22 : 19}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused && styles.labelActive]}>Profile</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 46,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.brand.coral,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 3,
  },
  labelActive: {
    color: Colors.brand.coral,
    fontWeight: '700',
  },
  askAiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255, 90, 95, 0.5)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  askAiIconContainerActive: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.brand.coral,
    borderWidth: 2.5,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  mascotImg: {
    width: '100%',
    height: '100%',
  },
});
