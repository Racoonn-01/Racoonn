import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Menu, X, User as UserIcon, Heart, Palmtree, Compass, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';

export default function RacoonnHeader() {
  const router = useRouter();
  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <View style={styles.floatingHeaderWrapper}>
        <View style={styles.floatingHeader}>
          {/* Logo */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}
          >
            <Image
              source={require('@/assets/images/Racoonn-Logo-02.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Right Actions */}
          <View style={styles.headerRightActions}>
            {isAuthenticated ? (
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={() => router.push('/profile' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarText}>
                  {(profile?.name || user?.name || 'U').slice(0, 1).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => router.push('/auth/login' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.signInBtnText}>Sign in</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => setIsMenuOpen(true)}
              activeOpacity={0.8}
            >
              <Menu color={Colors.brand.navy} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Slide-over Drawer Modal */}
      <Modal
        visible={isMenuOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <SafeAreaView style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <Image
              source={require('@/assets/images/Racoonn-Logo-02.png')}
              style={styles.drawerLogoImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsMenuOpen(false)}>
              <X color={Colors.brand.navy} size={22} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.drawerContent}>
            {isAuthenticated && (
              <View style={styles.userProfileCard}>
                <View style={styles.largeAvatar}>
                  <Text style={styles.largeAvatarText}>
                    {(profile?.name || user?.name || 'R').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.drawerUserName}>{profile?.name || user?.name || 'Traveler'}</Text>
                  <Text style={styles.drawerUserEmail}>{profile?.email || user?.email || 'traveler@racoonn.com'}</Text>
                </View>
              </View>
            )}

            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/' as any);
                }}
              >
                <Compass color={Colors.brand.coral} size={20} />
                <Text style={styles.menuItemText}>Explore Stays</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/packages' as any);
                }}
              >
                <Palmtree color={Colors.brand.coral} size={20} />
                <Text style={styles.menuItemText}>Tour Packages</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/two' as any);
                }}
              >
                <Heart color={Colors.brand.coral} size={20} />
                <Text style={styles.menuItemText}>Saved Wishlist</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/profile' as any);
                }}
              >
                <UserIcon color={Colors.brand.coral} size={20} />
                <Text style={styles.menuItemText}>My Account & Bookings</Text>
              </TouchableOpacity>
            </View>

            {isAuthenticated && (
              <TouchableOpacity
                style={styles.drawerLogoutBtn}
                onPress={async () => {
                  setIsMenuOpen(false);
                  await logout();
                }}
              >
                <LogOut color="#EF4444" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.drawerLogoutText}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingHeaderWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: Colors.brand.navy,
  },
  floatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  logoImage: {
    height: 36,
    width: 130,
  },
  drawerLogoImage: {
    height: 38,
    width: 140,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  signInBtn: {
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  menuBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
  },
  drawerContent: {
    padding: 20,
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  largeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  drawerUserEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginLeft: 14,
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  drawerLogoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
