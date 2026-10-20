import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { REAL_ROOM_IMAGE } from '@/constants/RealImages';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoomImageSliderProps {
  images: string[];
  isPopular?: boolean;
  sliderHeight?: number;
}

export default function RoomImageSlider({
  images,
  isPopular = false,
  sliderHeight = 220,
}: RoomImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const safeImages = images && images.length > 0
    ? images
    : [REAL_ROOM_IMAGE];

  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - 32);

  const handleScroll = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const layoutWidth = e.nativeEvent.layoutMeasurement.width || containerWidth;
    const index = Math.round(contentOffsetX / layoutWidth);
    if (index >= 0 && index < safeImages.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleLightboxScroll = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index >= 0 && index < safeImages.length && index !== lightboxIndex) {
      setLightboxIndex(index);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxVisible(true);
  };

  return (
    <View
      style={[styles.container, { height: sliderHeight }]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - containerWidth) > 1) {
          setContainerWidth(w);
        }
      }}
    >
      {/* Swipeable Room Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
      >
        {safeImages.map((imgUri, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.95}
            onPress={() => openLightbox(idx)}
            style={[styles.imageWrapper, { width: containerWidth, height: sliderHeight }]}
          >
            <Image
              source={{ uri: imgUri }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>


      {/* Photo Counter Pill */}
      {safeImages.length > 1 && (
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>
            {activeIndex + 1} / {safeImages.length}
          </Text>
        </View>
      )}

      {/* Pagination Dots */}
      {safeImages.length > 1 && safeImages.length <= 8 && (
        <View style={styles.dotsContainer}>
          {safeImages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}

      {/* Full-Screen Lightbox Modal */}
      <Modal
        visible={isLightboxVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsLightboxVisible(false)}
      >
        <SafeAreaView style={styles.lightboxContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          
          {/* Lightbox Header */}
          <View style={styles.lightboxHeader}>
            <View style={styles.lightboxCounterPill}>
              <Text style={styles.lightboxCounterText}>
                {lightboxIndex + 1} of {safeImages.length}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsLightboxVisible(false)}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>

          {/* Full Screen ScrollView */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleLightboxScroll}
            scrollEventThrottle={16}
            contentOffset={{ x: lightboxIndex * SCREEN_WIDTH, y: 0 }}
            style={styles.lightboxScroll}
          >
            {safeImages.map((imgUri, idx) => (
              <View key={idx} style={styles.lightboxImageSlide}>
                <Image
                  source={{ uri: imgUri }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Bottom Thumbnails Strip */}
          {safeImages.length > 1 && (
            <View style={styles.lightboxThumbStrip}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {safeImages.map((imgUri, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setLightboxIndex(idx)}
                    style={[
                      styles.lightboxThumb,
                      idx === lightboxIndex && styles.lightboxThumbActive,
                    ]}
                  >
                    <Image source={{ uri: imgUri }} style={styles.thumbImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  imageWrapper: {
    width: SCREEN_WIDTH - 32, // Card container margin
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  counterPill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    zIndex: 10,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    zIndex: 10,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  activeDot: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  // Lightbox
  lightboxContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    zIndex: 20,
  },
  lightboxCounterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  lightboxCounterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxScroll: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  lightboxImageSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  lightboxThumbStrip: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0A0E17',
  },
  lightboxThumb: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden',
    opacity: 0.5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lightboxThumbActive: {
    opacity: 1,
    borderColor: Colors.brand.coral,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
});
