import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const ACCENT = '#7c3aed';

const img = (seed, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const fmt = (n) => {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return Number(n).toLocaleString();
};

const fmtSec = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const USERS = [
  { id: 'u1', name: 'maya.codes' },
  { id: 'u2', name: 'leo_travels' },
  { id: 'u3', name: 'chef.amara' },
  { id: 'u4', name: 'zed.photo' },
  { id: 'u5', name: 'nina.moves' },
  { id: 'u6', name: 'kofi.art' },
];

const INITIAL_POSTS = [
  { id: 'p1', user: 'maya.codes', caption: 'Late night debugging session. Coffee count: 4 ☕', likes: 128, liked: false, saved: false, comments: [{ id: 'c1', user: 'leo_travels', text: 'Relatable 😂' }] },
  { id: 'p2', user: 'leo_travels', caption: 'Golden hour never gets old.', likes: 342, liked: false, saved: false, comments: [{ id: 'c2', user: 'zed.photo', text: 'Stunning shot!' }, { id: 'c3', user: 'nina.moves', text: 'Where is this?' }] },
  { id: 'p3', user: 'chef.amara', caption: 'Jollof test run #3. Getting closer 🔥', likes: 891, liked: false, saved: false, comments: [] },
  { id: 'p4', user: 'zed.photo', caption: 'City lights and long exposures.', likes: 207, liked: false, saved: false, comments: [{ id: 'c4', user: 'kofi.art', text: 'Love the colors' }] },
  { id: 'p5', user: 'nina.moves', caption: 'Sunday reset. Stretch, breathe, repeat.', likes: 76, liked: false, saved: false, comments: [] },
  { id: 'p6', user: 'kofi.art', caption: 'New piece finished today 🎨', likes: 514, liked: false, saved: false, comments: [] },
];

const makeReel = (i) => {
  const base = 1200 + i * 937;
  return {
    id: `r${i}`,
    seed: `reel${i}`,
    uri: null,
    caption: `Reel ${i + 1}`,
    date: `Sep ${i + 1}`,
    views: base * 3,
    reach: base * 2,
    likes: Math.round(base * 0.18),
    comments: Math.round(base * 0.02),
    shares: Math.round(base * 0.03),
    saves: Math.round(base * 0.04),
    followersPct: 38 + ((i * 5) % 30),
    avgWatch: 6 + i,
    totalWatchHrs: 12 + i * 3,
    graphTitle: 'Views, last 7 days',
    labels: [...DAYS],
    series: Array.from({ length: 7 }, (_, d) => Math.round(base * (0.3 + ((d * 37 + i * 11) % 10) / 10))),
  };
};

const INITIAL_REELS = Array.from({ length: 9 }, (_, i) => makeReel(i));
const reelUri = (r, w = 400, h = 700) => r.uri || img(r.seed, w, h);

/* ---------- shared bits ---------- */

function Avatar({ name, size = 56, ring = false }) {
  const inner = (
    <Image
      source={{ uri: img(name, 120, 120) }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#ddd' }}
    />
  );
  if (!ring) return inner;
  return (
    <View style={[styles.ring, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
      <View style={styles.ringGap}>{inner}</View>
    </View>
  );
}

function Stories() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stories} contentContainerStyle={{ paddingHorizontal: 12 }}>
      <View style={styles.story}>
        <View>
          <Avatar name="you" ring={false} />
          <View style={styles.plus}>
            <Ionicons name="add" size={14} color="#fff" />
          </View>
        </View>
        <Text style={styles.storyName}>Your story</Text>
      </View>
      {USERS.map((u) => (
        <View key={u.id} style={styles.story}>
          <Avatar name={u.name} ring />
          <Text style={styles.storyName} numberOfLines={1}>{u.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------- feed ---------- */

function Post({ post, onLike, onSave, onComment }) {
  const lastTap = useRef(0);
  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300 && !post.liked) onLike(post.id);
    lastTap.current = now;
  };
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Avatar name={post.user} size={34} />
        <Text style={[styles.username, { marginLeft: 8 }]}>{post.user}</Text>
        <Ionicons name="ellipsis-horizontal" size={20} color="#222" style={{ marginLeft: 'auto' }} />
      </View>
      <TouchableOpacity activeOpacity={1} onPress={handleImageTap}>
        <Image source={{ uri: img(post.id, 800, 800) }} style={styles.postImage} />
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onLike(post.id)}>
          <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={28} color={post.liked ? '#ef4444' : '#222'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onComment(post.id)} style={{ marginLeft: 16 }}>
          <Ionicons name="chatbubble-outline" size={26} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 16 }}>
          <Ionicons name="paper-plane-outline" size={26} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSave(post.id)} style={{ marginLeft: 'auto' }}>
          <Ionicons name={post.saved ? 'bookmark' : 'bookmark-outline'} size={26} color="#222" />
        </TouchableOpacity>
      </View>
      <Text style={styles.likes}>{post.likes.toLocaleString()} likes</Text>
      <Text style={styles.caption}>
        <Text style={styles.username}>{post.user} </Text>
        {post.caption}
      </Text>
      <TouchableOpacity onPress={() => onComment(post.id)}>
        <Text style={styles.viewComments}>
          {post.comments.length === 0 ? 'Add a comment…' : `View all ${post.comments.length} comment${post.comments.length > 1 ? 's' : ''}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function CommentsModal({ post, visible, onClose, onAdd, me }) {
  const [text, setText] = useState('');
  if (!post) return null;
  const submit = () => {
    if (!text.trim()) return;
    onAdd(post.id, text.trim());
    setText('');
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 28 : 0 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="chevron-down" size={28} color="#222" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comments</Text>
            <View style={{ width: 28 }} />
          </View>
          <FlatList
            data={post.comments}
            keyExtractor={(c) => c.id}
            ListEmptyComponent={<Text style={styles.empty}>No comments yet. Start the conversation.</Text>}
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <Avatar name={item.user} size={32} />
                <Text style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.username}>{item.user === 'you' ? me : item.user} </Text>
                  {item.text}
                </Text>
              </View>
            )}
          />
          <View style={styles.inputRow}>
            <Avatar name="you" size={32} />
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add a comment…"
              style={styles.input}
              onSubmitEditing={submit}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={submit}>
              <Text style={[styles.postBtn, { opacity: text.trim() ? 1 : 0.4 }]}>Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function HomeScreen({ posts, onLike, onSave, onComment }) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={<Stories />}
      renderItem={({ item }) => <Post post={item} onLike={onLike} onSave={onSave} onComment={onComment} />}
    />
  );
}

function SearchScreen() {
  const [q, setQ] = useState('');
  const tiles = Array.from({ length: 30 }, (_, i) => `explore${i}`);
  const size = width / 3;
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput value={q} onChangeText={setQ} placeholder="Search" style={{ flex: 1, marginLeft: 8 }} />
      </View>
      <FlatList
        data={tiles}
        numColumns={3}
        keyExtractor={(t) => t}
        renderItem={({ item }) => (
          <Image source={{ uri: img(item, 300, 300) }} style={{ width: size - 2, height: size - 2, margin: 1, backgroundColor: '#eee' }} />
        )}
      />
    </View>
  );
}

/* ---------- profile ---------- */

function ProfileScreen({ profile, setProfile, reels, onOpenReel }) {
  const [editing, setEditing] = useState(false);
  const size = width / 3;
  const shownName = profile.username || 'username';

  return (
    <FlatList
      data={editing ? [] : reels}
      numColumns={3}
      key={editing ? 'editing' : 'grid'}
      keyExtractor={(r) => r.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          {/* Username row: updates live while typing in the edit form */}
          <View style={styles.profileTop}>
            <Ionicons name="lock-closed-outline" size={16} color="#222" />
            <Text style={styles.profileUsername} numberOfLines={1}>{shownName}</Text>
            <Ionicons name="chevron-down" size={16} color="#222" />
            {editing && (
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            )}
          </View>

          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar name="you" size={84} ring />
              <View style={styles.stats}>
                <View style={styles.stat}><Text style={styles.statNum}>{reels.length}</Text><Text style={styles.statLabel}>Reels</Text></View>
                <View style={styles.stat}><Text style={styles.statNum}>1,204</Text><Text style={styles.statLabel}>Followers</Text></View>
                <View style={styles.stat}><Text style={styles.statNum}>312</Text><Text style={styles.statLabel}>Following</Text></View>
              </View>
            </View>
            <Text style={[styles.username, { marginTop: 12 }]}>{profile.name || shownName}</Text>
            {!!profile.bio && <Text style={{ color: '#444', marginTop: 2 }}>{profile.bio}</Text>}

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => setEditing(!editing)}
                style={[styles.btn, editing ? styles.btnPrimary : styles.btnGhost]}
              >
                <Text style={{ color: editing ? '#fff' : '#222', fontWeight: '600' }}>{editing ? 'Done' : 'Edit profile'}</Text>
              </TouchableOpacity>
              {!editing && (
                <TouchableOpacity style={[styles.btn, styles.btnGhost, { marginLeft: 8 }]}>
                  <Text style={{ fontWeight: '600' }}>Share profile</Text>
                </TouchableOpacity>
              )}
            </View>

            {editing && (
              <View style={styles.form}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  value={profile.name}
                  onChangeText={(t) => setProfile({ ...profile, name: t })}
                  placeholder="Name"
                  style={styles.field}
                />
                <Text style={styles.label}>Username</Text>
                <TextInput
                  value={profile.username}
                  onChangeText={(t) => setProfile({ ...profile, username: t.replace(/\s/g, '').slice(0, 30) })}
                  placeholder="username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.field}
                />
                <Text style={styles.hint}>Changes show on your profile, and on your comments, as you type.</Text>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  value={profile.bio}
                  onChangeText={(t) => setProfile({ ...profile, bio: t })}
                  placeholder="Bio"
                  multiline
                  style={[styles.field, { minHeight: 64, textAlignVertical: 'top' }]}
                />
              </View>
            )}
          </View>

          {!editing && (
            <View style={styles.gridTab}>
              <Ionicons name="film-outline" size={24} color="#222" />
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.85} onPress={() => onOpenReel(item.id)}>
          <Image source={{ uri: reelUri(item, 300, 500) }} style={{ width: size - 2, height: (size - 2) * 1.6, margin: 1, backgroundColor: '#eee' }} />
          <Ionicons name="film" size={16} color="#fff" style={styles.tileIcon} />
          <View style={styles.tileViews}>
            <Ionicons name="play" size={12} color="#fff" />
            <Text style={styles.tileViewsText}>{fmt(item.views)}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

/* ---------- reels ---------- */

function ReelViewer({ reel, visible, onClose, onInsights }) {
  if (!reel) return null;
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewer}>
        <Image source={{ uri: reelUri(reel, 600, 1000) }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.viewerShade} />
        <TouchableOpacity onPress={onClose} style={styles.viewerClose}>
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="play-circle" size={72} color="rgba(255,255,255,0.85)" style={{ alignSelf: 'center', marginTop: '55%' }} />
        <View style={styles.viewerBottom}>
          <Text style={styles.viewerCaption}>{reel.caption}</Text>
          <Text style={styles.viewerSub}>{fmt(reel.views)} views · {reel.date}</Text>
          <TouchableOpacity onPress={onInsights} style={styles.insightsBtn}>
            <Ionicons name="stats-chart" size={18} color="#fff" />
            <Text style={styles.insightsBtnText}>View insights</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Number that turns into an input while editing
function Num({ value, onChange, editing, style, suffix = '', max }) {
  if (!editing) return <Text style={style}>{fmt(value)}{suffix}</Text>;
  return (
    <TextInput
      value={String(value)}
      onChangeText={(t) => {
        let n = parseInt(t.replace(/[^0-9]/g, ''), 10);
        if (isNaN(n)) n = 0;
        if (max !== undefined) n = Math.min(max, n);
        onChange(n);
      }}
      keyboardType="numeric"
      selectTextOnFocus
      style={[style, styles.editField]}
    />
  );
}

// Text that turns into an input while editing
function Txt({ value, onChange, editing, style, placeholder }) {
  if (!editing) return <Text style={style}>{value}</Text>;
  return <TextInput value={value} onChangeText={onChange} placeholder={placeholder} style={[style, styles.editField]} />;
}

function BarGraph({ series, labels, editing, onValue, onLabel }) {
  const maxV = Math.max(...series, 1);
  const H = 120;
  return (
    <View style={styles.graph}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: H + 4 }}>
        {series.map((v, i) => (
          <View key={i} style={styles.barCol}>
            <View style={[styles.bar, { height: Math.max(3, (v / maxV) * H) }]} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        {series.map((v, i) => (
          <View key={i} style={styles.barCol}>
            {editing ? (
              <>
                <TextInput
                  value={String(v)}
                  onChangeText={(t) => onValue(i, parseInt(t.replace(/[^0-9]/g, ''), 10) || 0)}
                  keyboardType="numeric"
                  selectTextOnFocus
                  style={styles.barInput}
                />
                <TextInput value={labels[i]} onChangeText={(t) => onLabel(i, t)} style={[styles.barInput, { color: '#666' }]} />
              </>
            ) : (
              <Text style={styles.barLabel}>{labels[i]}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function InsightsModal({ reel, visible, onClose, onChange }) {
  const [editing, setEditing] = useState(false);
  const lastTap = useRef(0);
  if (!reel) return null;

  const set = (patch) => onChange(reel.id, patch);
  const close = () => {
    setEditing(false);
    onClose();
  };
  const onTitleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) setEditing((e) => !e);
    lastTap.current = now;
  };
  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!res.canceled && res.assets && res.assets[0]) set({ uri: res.assets[0].uri });
    } catch (e) {
      // picker unavailable, ignore
    }
  };

  const followersPct = reel.followersPct;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 28 : 0 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={close}>
              <Ionicons name="chevron-back" size={28} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} onPress={onTitleTap}>
              <Text style={styles.modalTitle}>Reel insights</Text>
            </TouchableOpacity>
            {editing ? (
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.postBtn}>Done</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
            {editing ? (
              <View style={styles.editBanner}>
                <Ionicons name="create-outline" size={16} color={ACCENT} />
                <Text style={styles.editBannerText}>Edit mode: tap any number, text, graph bar or image</Text>
              </View>
            ) : (
              <Text style={styles.dblHint}>Double-tap “Reel insights” to edit</Text>
            )}

            {/* thumbnail + title */}
            <View style={{ flexDirection: 'row', padding: 16 }}>
              <Image source={{ uri: reelUri(reel, 200, 340) }} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 14, justifyContent: 'center' }}>
                <Txt value={reel.caption} onChange={(t) => set({ caption: t })} editing={editing} style={styles.reelCaption} placeholder="Caption" />
                <Txt value={reel.date} onChange={(t) => set({ date: t })} editing={editing} style={styles.reelDate} placeholder="Date" />
              </View>
            </View>

            {editing && (
              <View style={styles.imageTools}>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity style={styles.toolBtn} onPress={pickImage}>
                    <Ionicons name="images-outline" size={16} color="#222" />
                    <Text style={styles.toolBtnText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.toolBtn, { marginLeft: 8 }]} onPress={() => set({ uri: img(`s${Date.now()}`, 400, 700) })}>
                    <Ionicons name="shuffle-outline" size={16} color="#222" />
                    <Text style={styles.toolBtnText}>Random</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.toolBtn, { marginLeft: 8 }]} onPress={() => set({ uri: null })}>
                    <Ionicons name="refresh-outline" size={16} color="#222" />
                    <Text style={styles.toolBtnText}>Reset</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={reel.uri || ''}
                  onChangeText={(t) => set({ uri: t.trim() ? t.trim() : null })}
                  placeholder="…or paste an image URL"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.field, { marginTop: 8 }]}
                />
              </View>
            )}

            {/* overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Num value={reel.views} onChange={(n) => set({ views: n })} editing={editing} style={styles.bigNum} />
              <Text style={styles.statLabel}>Views</Text>

              <View style={styles.splitBar}>
                <View style={{ flex: Math.max(followersPct, 0.001), backgroundColor: ACCENT }} />
                <View style={{ flex: Math.max(100 - followersPct, 0.001), backgroundColor: '#d8c8fb' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.splitText}>Followers </Text>
                  <Num value={followersPct} onChange={(n) => set({ followersPct: n })} editing={editing} suffix="%" max={100} style={styles.splitText} />
                </View>
                <Text style={styles.splitText}>Non-followers {100 - followersPct}%</Text>
              </View>
            </View>

            {/* interactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interactions</Text>
              <View style={styles.grid2}>
                {[
                  ['Likes', 'likes', 'heart-outline'],
                  ['Comments', 'comments', 'chatbubble-outline'],
                  ['Shares', 'shares', 'paper-plane-outline'],
                  ['Saves', 'saves', 'bookmark-outline'],
                ].map(([label, key, icon]) => (
                  <View key={key} style={styles.card}>
                    <Ionicons name={icon} size={20} color="#222" />
                    <Num value={reel[key]} onChange={(n) => set({ [key]: n })} editing={editing} style={styles.cardNum} />
                    <Text style={styles.statLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* watch time + reach */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reach and watch time</Text>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Accounts reached</Text>
                <Num value={reel.reach} onChange={(n) => set({ reach: n })} editing={editing} style={styles.rowValue} />
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Average watch time (sec)</Text>
                {editing ? (
                  <Num value={reel.avgWatch} onChange={(n) => set({ avgWatch: n })} editing style={styles.rowValue} />
                ) : (
                  <Text style={styles.rowValue}>{fmtSec(reel.avgWatch)}</Text>
                )}
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Total watch time (hours)</Text>
                <Num value={reel.totalWatchHrs} onChange={(n) => set({ totalWatchHrs: n })} editing={editing} suffix={editing ? '' : ' hrs'} style={styles.rowValue} />
              </View>
            </View>

            {/* graph */}
            <View style={styles.section}>
              <Txt value={reel.graphTitle} onChange={(t) => set({ graphTitle: t })} editing={editing} style={styles.sectionTitle} placeholder="Graph title" />
              <BarGraph
                series={reel.series}
                labels={reel.labels}
                editing={editing}
                onValue={(i, v) => set({ series: reel.series.map((x, j) => (j === i ? v : x)) })}
                onLabel={(i, t) => set({ labels: reel.labels.map((x, j) => (j === i ? t : x)) })}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [tab, setTab] = useState('home');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [openPostId, setOpenPostId] = useState(null);
  const [profile, setProfile] = useState({ username: 'your.username', name: 'Your Name', bio: 'Building cool things. Sharing light. ✨' });
  const [reels, setReels] = useState(INITIAL_REELS);
  const [viewerId, setViewerId] = useState(null);
  const [insightsId, setInsightsId] = useState(null);

  const update = (id, fn) => setPosts((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));
  const onLike = (id) => update(id, (p) => ({ ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }));
  const onSave = (id) => update(id, (p) => ({ ...p, saved: !p.saved }));
  const onAddComment = (id, text) =>
    update(id, (p) => ({ ...p, comments: [...p.comments, { id: `c${Date.now()}`, user: 'you', text }] }));
  const onReelChange = (id, patch) => setReels((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const openPost = posts.find((p) => p.id === openPostId);
  const viewerReel = reels.find((r) => r.id === viewerId);
  const insightsReel = reels.find((r) => r.id === insightsId);
  const me = profile.username || 'username';

  const tabs = [
    { key: 'home', icon: 'home' },
    { key: 'search', icon: 'search' },
    { key: 'add', icon: 'add-circle' },
    { key: 'profile', icon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {tab !== 'profile' && (
        <View style={styles.topBar}>
          <Text style={styles.logo}>Lumina</Text>
          <View style={{ flexDirection: 'row' }}>
            <Ionicons name="heart-outline" size={26} color="#222" />
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#222" style={{ marginLeft: 16 }} />
          </View>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {tab === 'home' && <HomeScreen posts={posts} onLike={onLike} onSave={onSave} onComment={setOpenPostId} />}
        {tab === 'search' && <SearchScreen />}
        {tab === 'add' && (
          <View style={styles.center}>
            <Ionicons name="camera-outline" size={64} color="#bbb" />
            <Text style={{ color: '#888', marginTop: 8 }}>Post creation coming soon (mock)</Text>
          </View>
        )}
        {tab === 'profile' && (
          <ProfileScreen profile={profile} setProfile={setProfile} reels={reels} onOpenReel={setViewerId} />
        )}
      </KeyboardAvoidingView>

      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={styles.tabItem}>
            <Ionicons
              name={tab === t.key || t.key === 'add' ? t.icon : `${t.icon}-outline`}
              size={t.key === 'add' ? 32 : 26}
              color={tab === t.key ? ACCENT : '#222'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <CommentsModal post={openPost} visible={!!openPost} onClose={() => setOpenPostId(null)} onAdd={onAddComment} me={me} />
      <ReelViewer
        reel={viewerReel}
        visible={!!viewerReel && !insightsReel}
        onClose={() => setViewerId(null)}
        onInsights={() => setInsightsId(viewerId)}
      />
      <InsightsModal reel={insightsReel} visible={!!insightsReel} onClose={() => setInsightsId(null)} onChange={onReelChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 28 : 0 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  logo: { fontSize: 26, fontWeight: '800', color: ACCENT, letterSpacing: 0.5 },
  tabBar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ddd', paddingVertical: 8, backgroundColor: '#fff' },
  tabItem: { flex: 1, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stories: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  story: { alignItems: 'center', marginHorizontal: 6, width: 72 },
  storyName: { fontSize: 11, marginTop: 4, color: '#333' },
  ring: { borderWidth: 2.5, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  ringGap: { backgroundColor: '#fff', borderRadius: 40, padding: 2 },
  plus: { position: 'absolute', right: -2, bottom: -2, backgroundColor: ACCENT, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  post: { marginBottom: 14 },
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  username: { fontWeight: '700' },
  postImage: { width, height: width, backgroundColor: '#eee' },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10 },
  likes: { fontWeight: '700', paddingHorizontal: 12, marginTop: 8 },
  caption: { paddingHorizontal: 12, marginTop: 4 },
  viewComments: { paddingHorizontal: 12, marginTop: 4, color: '#888' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
  modalTitle: { fontWeight: '700', fontSize: 16, paddingHorizontal: 12, paddingVertical: 4 },
  comment: { flexDirection: 'row', alignItems: 'flex-start', padding: 12 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ddd' },
  input: { flex: 1, marginHorizontal: 10, paddingVertical: 8 },
  postBtn: { color: ACCENT, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f1f1', margin: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },

  // profile
  profileTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  profileUsername: { fontSize: 20, fontWeight: '800', marginHorizontal: 6, flexShrink: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', backgroundColor: '#e8f9ee', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 5 },
  liveText: { color: '#15803d', fontSize: 12, fontWeight: '700' },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: 10 },
  stat: { alignItems: 'center' },
  statNum: { fontWeight: '800', fontSize: 17 },
  statLabel: { color: '#555', fontSize: 12 },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  btnPrimary: { backgroundColor: ACCENT },
  btnGhost: { backgroundColor: '#efefef' },
  form: { marginTop: 16 },
  label: { fontSize: 12, color: '#777', marginTop: 10, marginBottom: 4 },
  field: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fafafa' },
  hint: { fontSize: 11, color: '#888', marginTop: 4 },
  gridTab: { alignItems: 'center', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ddd', borderBottomWidth: 2, borderBottomColor: '#222', marginTop: 8, marginBottom: 2 },
  tileIcon: { position: 'absolute', top: 8, right: 8 },
  tileViews: { position: 'absolute', left: 8, bottom: 8, flexDirection: 'row', alignItems: 'center' },
  tileViewsText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 3 },

  // reel viewer
  viewer: { flex: 1, backgroundColor: '#000' },
  viewerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  viewerClose: { position: 'absolute', top: Platform.OS === 'android' ? 44 : 56, left: 16, zIndex: 2 },
  viewerBottom: { position: 'absolute', left: 16, right: 16, bottom: 36 },
  viewerCaption: { color: '#fff', fontSize: 18, fontWeight: '700' },
  viewerSub: { color: '#eee', marginTop: 2, marginBottom: 14 },
  insightsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 10 },
  insightsBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

  // insights
  dblHint: { textAlign: 'center', color: '#999', fontSize: 12, paddingTop: 8 },
  editBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3ecff', paddingVertical: 8 },
  editBannerText: { color: ACCENT, fontWeight: '600', fontSize: 12, marginLeft: 6 },
  editField: { borderBottomWidth: 1, borderBottomColor: ACCENT, backgroundColor: '#f8f4ff', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 4 },
  thumb: { width: 90, height: 150, borderRadius: 10, backgroundColor: '#eee' },
  reelCaption: { fontSize: 17, fontWeight: '700' },
  reelDate: { color: '#777', marginTop: 4 },
  imageTools: { paddingHorizontal: 16, paddingBottom: 8 },
  toolBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#efefef', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  toolBtnText: { marginLeft: 6, fontWeight: '600' },
  section: { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e5e5' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  bigNum: { fontSize: 38, fontWeight: '800' },
  splitBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 12 },
  splitText: { fontSize: 13, color: '#444' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#f6f6f8', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardNum: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  rowLabel: { color: '#333', flexShrink: 1 },
  rowValue: { fontWeight: '700', minWidth: 60, textAlign: 'right' },
  graph: { marginTop: 6 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '55%', backgroundColor: ACCENT, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barLabel: { fontSize: 11, color: '#777' },
  barInput: { width: '92%', fontSize: 10, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: ACCENT, backgroundColor: '#f8f4ff', paddingVertical: 2, paddingHorizontal: 0, marginBottom: 3 },
});
