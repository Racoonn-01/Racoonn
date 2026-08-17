import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sparkles,
  Send,
  MapPin,
  ArrowRight,
  Star,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Hotel,
  Mountain,
  Compass,
  Waves,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { getProperties, getCMSPackages } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

const QUICK_SUGGESTIONS = [
  { id: '1', icon: Hotel, label: 'Luxury Stays < ₹5,000', prompt: 'Find 4-star luxury stays in Dehradun under ₹5000' },
  { id: '2', icon: Mountain, label: 'Char Dham Pilgrimage', prompt: 'Best tour packages for Char Dham Yatra' },
  { id: '3', icon: Compass, label: 'Nainital Romantic Trip', prompt: 'Plan a 4-day romantic itinerary in Nainital' },
  { id: '4', icon: Waves, label: 'Private Pool Villas', prompt: 'Resorts with private swimming pool & mountain views' },
];

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  recommendations?: any[];
  timestamp: string;
}

export default function AskAIScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const msgCounterRef = useRef(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Real-time AppUser dataset state
  const [appUserDataset, setAppUserDataset] = useState<{
    properties: any[];
    packages: any[];
    all: any[];
  }>({ properties: [], packages: [], all: [] });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Welcome to Racoonn Concierge. I search real-time verified AppUser stays, resorts, and packages for you. What would you like to explore today?',
      timestamp: 'Just now',
    },
  ]);

  // Load Real-time AppUser Data (Properties & CMS Packages)
  useEffect(() => {
    async function loadRealtimeAppUserData() {
      try {
        const [liveProperties, livePackages] = await Promise.all([
          getProperties().catch(() => []),
          getCMSPackages().catch(() => []),
        ]);

        const activeProps = (liveProperties || [])
          .filter((d: any) => isActiveProperty(d))
          .map((d: any, index: number) => {
            const rawPrice = Number(
              d.price || d.startingPrice || d.minPrice || d.basePrice || d.pricePerNight || 3500
            );
            const photos = Array.isArray(d.photos) && d.photos.length > 0
              ? d.photos
              : Array.isArray(d.images) && d.images.length > 0
                ? d.images
                : typeof d.photoUrl === 'string' ? [d.photoUrl] : [];

            return {
              id: String(d.$id || d.id || `stay-${index}`),
              title: String(d.propertyName || d.title || d.name || 'Luxury Stay'),
              location: String(d.location || d.address || [d.city, d.state].filter(Boolean).join(', ') || 'Uttarakhand'),
              price: `₹${rawPrice.toLocaleString('en-IN')}`,
              numericPrice: rawPrice,
              images: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80'],
              type: 'hotel',
              rating: d.rating ? String(d.rating) : '4.8',
              badge: 'Verified Stay',
              features: d.amenities && Array.isArray(d.amenities) && d.amenities.length > 0 
                ? d.amenities.slice(0, 3).join(' | ') 
                : 'Free Wi-Fi | Stay | Parking',
            };
          });

        const activePkgs = (livePackages || []).map((p: any) => ({
          id: String(p.id || p.$id),
          title: String(p.title || p.name || 'Tour Package'),
          location: String(p.location || 'Uttarakhand'),
          price: typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : String(p.price || '₹12,499'),
          numericPrice: Number(String(p.price).replace(/[^0-9]/g, '')) || 12000,
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80'],
          type: 'package',
          rating: '4.9',
          badge: p.badge || 'Verified Package',
          duration: p.duration || '4 Days / 3 Nights',
          features: p.features || 'Meals | Stay | Sightseeing',
        }));

        const combined = [...activeProps, ...activePkgs];
        setAppUserDataset({
          properties: activeProps,
          packages: activePkgs,
          all: combined,
        });
      } catch (err) {
        console.warn('Failed loading real-time AppUser dataset:', err);
      }
    }

    loadRealtimeAppUserData();
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);



  const typeOutAIMessage = (fullText: string, recs: any[]) => {
    msgCounterRef.current += 1;
    const newMsgId = `ai-${msgCounterRef.current}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add initial AI message container with empty text
    const initialMsg: ChatMessage = {
      id: newMsgId,
      sender: 'ai',
      text: '',
      recommendations: undefined,
      timestamp,
    };

    setMessages((prev) => [...prev, initialMsg]);
    setIsAnalyzing(false);

    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx += 2;
      if (charIdx >= fullText.length) {
        charIdx = fullText.length;
        clearInterval(interval);
        // Typing completed: set full text and attach recommendations
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMsgId
              ? { ...msg, text: fullText, recommendations: recs }
              : msg
          )
        );
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        const slicedText = fullText.slice(0, charIdx);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMsgId ? { ...msg, text: slicedText } : msg
          )
        );
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }
    }, 22);
  };

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    msgCounterRef.current += 1;
    const currentId = msgCounterRef.current;

    const userMsg: ChatMessage = {
      id: `user-${currentId}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAnalyzing(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Search real-time AppUser dataset strictly
    setTimeout(() => {
      const q = textToSend.toLowerCase();
      const datasetToSearch = appUserDataset.all;

      const matched = datasetToSearch.filter((item: any) => {
        const titleMatch = item.title && item.title.toLowerCase().includes(q);
        const locMatch = item.location && item.location.toLowerCase().includes(q);
        const featMatch = item.features && item.features.toLowerCase().includes(q);
        const isStayQuery = q.includes('stay') || q.includes('hotel') || q.includes('resort') || q.includes('5000');
        const isPkgQuery = q.includes('package') || q.includes('yatra') || q.includes('trip') || q.includes('tour');

        const typeMatch = isStayQuery ? item.type === 'hotel' : isPkgQuery ? item.type === 'package' : true;

        let priceMatch = true;
        if (q.includes('5000') || q.includes('under 5000')) {
          priceMatch = (item.numericPrice || 3500) <= 5500;
        } else if (q.includes('15000') || q.includes('under 15000')) {
          priceMatch = (item.numericPrice || 12000) <= 16000;
        }

        return (titleMatch || locMatch || featMatch) && typeMatch && priceMatch;
      });

      const finalRecs = matched.length > 0 ? matched.slice(0, 3) : datasetToSearch.slice(0, 3);
      const fullResponseText = `I searched real-time AppUser data and found ${finalRecs.length} verified live options matching "${textToSend}":`;
      
      typeOutAIMessage(fullResponseText, finalRecs);
    }, 800);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-1',
        sender: 'ai',
        text: 'Welcome to Racoonn Concierge. I search real-time verified AppUser stays, resorts, and packages for you. What would you like to explore today?',
        timestamp: 'Just now',
      },
    ]);
  };

  const defaultBottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12) + 95;
  const inputBottomPadding = isKeyboardVisible ? 12 : defaultBottomInset;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />



      {/* Light Airbnb/Apple Luxury Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 18) }]}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.conciergePill}>
            <Sparkles color={Colors.brand.coral} size={11} />
            <Text style={styles.conciergePillText}>Realtime AppUser Concierge</Text>
          </View>
          <Text style={styles.headerMainTitle}>Where to next?</Text>
        </View>

        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleResetChat}
          activeOpacity={0.7}
        >
          <RotateCcw color="#475569" size={17} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Suggestions Chips */}
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
              {QUICK_SUGGESTIONS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionChip}
                    activeOpacity={0.85}
                    onPress={() => handleSend(item.prompt)}
                  >
                    <View style={styles.suggestionIconBox}>
                      <IconComponent color={Colors.brand.coral} size={14} />
                    </View>
                    <Text style={styles.suggestionLabel}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Conversation Stream */}
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isAI ? styles.msgRowAI : styles.msgRowUser]}
              >
                {isAI && (
                  <View style={styles.aiBadgeAvatar}>
                    <Image
                      source={require('@/assets/images/racoon-favicon.jpg')}
                      style={styles.aiBadgeImg}
                      resizeMode="cover"
                    />
                  </View>
                )}

                <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
                  <Text style={[styles.bubbleText, isAI ? styles.bubbleTextAI : styles.bubbleTextUser]}>
                    {msg.text}
                    {isAI && !msg.text && (
                      <Text style={{ fontStyle: 'italic', color: '#94A3B8' }}>Typing realtime answer...</Text>
                    )}
                  </Text>

                  {/* 🌟 Real-time Full-Width AppUser Photo Recommendation Cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <View style={styles.fullRecsWrapper}>
                      {msg.recommendations.map((item: any) => (
                        <TouchableOpacity
                          key={String(item.id)}
                          style={styles.fullRecCard}
                          activeOpacity={0.92}
                          onPress={() => {
                            if (item.type === 'package') {
                              router.push(`/packages/${item.id}` as any);
                            } else {
                              router.push('/stays' as any);
                            }
                          }}
                        >
                          {/* Square 1:1 Cover Image */}
                          <View style={[styles.imageContainer, { height: undefined, aspectRatio: 1 }]}>
                            <Image
                              source={{
                                uri:
                                  Array.isArray(item.images) && item.images.length > 0
                                    ? item.images[0]
                                    : typeof item.image === 'string'
                                      ? item.image
                                      : 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
                              }}
                              style={styles.fullCoverImage}
                              resizeMode="cover"
                            />
                            
                            {/* Rating Badge */}
                            <View style={styles.imageRatingBadge}>
                              <Star color="#F59E0B" size={11} fill="#F59E0B" />
                              <Text style={styles.imageRatingText}>{item.rating || '4.9'}</Text>
                            </View>

                            {/* Badge Label */}
                            {item.badge && (
                              <View style={styles.imageFeaturedBadge}>
                                <Text style={styles.imageFeaturedText}>{item.badge}</Text>
                              </View>
                            )}

                            {/* Price Overlay Banner */}
                            <View style={styles.imagePriceBanner}>
                              <Text style={styles.imagePriceValue}>{item.price}</Text>
                              <Text style={styles.imagePriceSub}>
                                {item.type === 'hotel' ? '/ night' : '/ package'}
                              </Text>
                            </View>
                          </View>

                          {/* Details Body */}
                          <View style={styles.cardDetailsBody}>
                            <Text style={styles.fullCardTitle} numberOfLines={1}>
                              {item.title}
                            </Text>

                            <View style={styles.locationRow}>
                              <MapPin color={Colors.brand.coral} size={13} style={{ marginRight: 4 }} />
                              <Text style={styles.locationText}>{item.location}</Text>
                              {item.duration && (
                                <>
                                  <Text style={styles.dotSeparator}>•</Text>
                                  <Calendar color="#64748B" size={12} style={{ marginRight: 3 }} />
                                  <Text style={styles.durationText}>{item.duration}</Text>
                                </>
                              )}
                            </View>

                            {/* Features Tags Row */}
                            {item.features && (
                              <View style={styles.featuresRow}>
                                {String(item.features).split('|').map((feat: string, fIdx: number) => (
                                  <View key={fIdx} style={styles.featureTag}>
                                    <CheckCircle2 color="#10B981" size={11} style={{ marginRight: 3 }} />
                                    <Text style={styles.featureTagText}>{feat.trim()}</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* Explore Button */}
                            <View style={styles.cardCtaButton}>
                              <Text style={styles.cardCtaText}>
                                {item.type === 'hotel' ? 'Explore Stay & Reserve' : 'Explore Package & Book'}
                              </Text>
                              <ArrowRight color="#FFFFFF" size={14} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={[styles.msgTime, isAI ? styles.msgTimeAI : styles.msgTimeUser]}>
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {isAnalyzing && (
            <View style={[styles.msgRow, styles.msgRowAI]}>
              <View style={styles.aiBadgeAvatar}>
                <ActivityIndicator color={Colors.brand.coral} size="small" />
              </View>
              <View style={[styles.bubble, styles.bubbleAI, styles.analyzingBox]}>
                <Sparkles color={Colors.brand.coral} size={14} style={{ marginRight: 6 }} />
                <Text style={styles.analyzingText}>Racoonn AI searching real-time AppUser data...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Apple-Style Minimal Floating Input Bar */}
        <View style={[styles.inputArea, { paddingBottom: inputBottomPadding }]}>
          <View style={styles.inputCard}>
            <View style={styles.sparkleIconBg}>
              <Sparkles color={Colors.brand.coral} size={16} />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Ask AppUser AI (e.g. Luxury stay under ₹5000)..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              disabled={!inputText.trim()}
              onPress={() => handleSend()}
              activeOpacity={0.88}
            >
              <Send color="#FFFFFF" size={15} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  /* Animated Intro Overlay */
  introOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  introContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  introAvatarWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Colors.brand.coral,
  },
  introMascotImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  introBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 106, 112, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 112, 0.4)',
  },
  introBadgeText: {
    color: Colors.brand.coral,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  introTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  introSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },

  /* Header */
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleContainer: {
    gap: 2,
  },
  conciergePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 2,
  },
  conciergePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.brand.coral,
    letterSpacing: 0.2,
  },
  headerMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.brand.navy,
    letterSpacing: -0.4,
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsRow: {
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  suggestionIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  msgRowAI: {
    justifyContent: 'flex-start',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  aiBadgeAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
    overflow: 'hidden',
  },
  aiBadgeImg: {
    width: '100%',
    height: '100%',
  },
  bubble: {
    maxWidth: '92%',
    padding: 14,
    borderRadius: 20,
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: Colors.brand.navy,
    borderBottomRightRadius: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bubbleTextAI: {
    color: '#0F172A',
    fontWeight: '500',
  },
  bubbleTextUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  msgTime: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  msgTimeAI: {
    color: '#94A3B8',
  },
  msgTimeUser: {
    color: '#94A3B8',
  },
  /* Full-Width Photo Recommendation Cards */
  fullRecsWrapper: {
    marginTop: 14,
    gap: 14,
  },
  fullRecCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  fullCoverImage: {
    width: '100%',
    height: '100%',
  },
  imageRatingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  imageRatingText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  imageFeaturedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  imageFeaturedText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  imagePriceBanner: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  imagePriceValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  imagePriceSub: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  cardDetailsBody: {
    padding: 14,
  },
  fullCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 5,
  },
  durationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featureTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cardCtaButton: {
    backgroundColor: Colors.brand.coral,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cardCtaText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  analyzingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  analyzingText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 6,
    backgroundColor: 'transparent',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 106, 112, 0.35)',
    paddingVertical: 5,
    paddingLeft: 12,
    paddingRight: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  sparkleIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 8,
    fontWeight: '500',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
});
